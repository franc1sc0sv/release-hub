import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, MailCheck, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '@/context/auth.context'
import { useSetAbility } from '@/context/ability.context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ROUTES } from '@/lib/routes'
import { ACCEPT_INVITATION } from '../graphql/collaboration.operations'
import { defineAbilityFor, type IProjectMembership, ProjectRole } from '@release-hub/shared'
import type { ProjectRole as GqlProjectRole } from '@/generated/graphql'
import { slideUp, easeSoft } from '@/lib/animations'

const GQL_ROLE_MAP: Record<GqlProjectRole, IProjectMembership['role']> = {
  OWNER: ProjectRole.OWNER,
  MEMBER: ProjectRole.MEMBER,
  VIEWER: ProjectRole.VIEWER,
}

type PageState = 'idle' | 'accepting' | 'success' | 'error' | 'mismatch'

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation('collaboration')
  const { user } = useAuth()
  const navigate = useNavigate()
  const setAbility = useSetAbility()
  const [pageState, setPageState] = useState<PageState>('idle')

  const returnTo = `/invite/${token ?? ''}`

  const [acceptInvitation] = useMutation(ACCEPT_INVITATION, {
    onCompleted(data) {
      if (user) {
        const memberships: IProjectMembership[] = [
          {
            projectId: data.acceptInvitation.projectId,
            role: GQL_ROLE_MAP[data.acceptInvitation.role],
          },
        ]
        setAbility(defineAbilityFor(memberships))
      }
      setPageState('success')
      setTimeout(() => navigate(ROUTES.WORKSPACE), 1500)
    },
    onError(error) {
      const isForbidden =
        CombinedGraphQLErrors.is(error) &&
        error.errors.some((e) => e.extensions?.['code'] === 'FORBIDDEN')
      setPageState(isForbidden ? 'mismatch' : 'error')
    },
  })

  useEffect(() => {
    if (!user) return
    if (!token) {
      setPageState('error')
      return
    }
    setPageState('accepting')
    acceptInvitation({ variables: { token } })
  }, [user, token, acceptInvitation])

  if (!user) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: easeSoft }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MailCheck className="size-5" />
              </div>
              <CardTitle className="font-display text-xl">{t('acceptInvite.title')}</CardTitle>
              <CardDescription>{t('acceptInvite.loginPrompt')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() =>
                  navigate(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`)
                }
              >
                {t('acceptInvite.accept')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, ease: easeSoft }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MailCheck className="size-5" />
            </div>
            <CardTitle className="font-display text-xl">{t('acceptInvite.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {(pageState === 'idle' || pageState === 'accepting') && (
              <>
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('acceptInvite.accepting')}</p>
              </>
            )}
            {pageState === 'success' && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="size-6 text-green-500" />
                <p className="text-sm text-muted-foreground">{t('acceptInvite.accepted')}</p>
              </div>
            )}
            {pageState === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{t('acceptInvite.error')}</AlertDescription>
              </Alert>
            )}
            {pageState === 'mismatch' && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{t('acceptInvite.mismatch')}</AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    navigate(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`)
                  }}
                >
                  {t('acceptInvite.signInDifferent')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
