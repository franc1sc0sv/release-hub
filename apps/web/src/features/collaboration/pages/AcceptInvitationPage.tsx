import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, MailCheck, CheckCircle2 } from 'lucide-react'
import { m } from 'motion/react'
import { useAuth } from '@/context/auth.context'
import { useSetAbility } from '@/context/ability.context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GlassCard } from '@/components/nebula/GlassCard'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton'
import { ROUTES } from '@/lib/routes'
import { ACCEPT_INVITATION } from '../graphql/collaboration.operations'
import { defineAbilityFor, type IOrgMembership, OrgRole } from '@release-hub/shared'
import type { OrgRole as GqlOrgRole } from '@/generated/graphql'
import { slideUp, easeSoft } from '@/lib/animations'

const ORG_ROLE_MAP: Record<GqlOrgRole, OrgRole> = {
  owner: OrgRole.OWNER,
  member: OrgRole.MEMBER,
  viewer: OrgRole.VIEWER,
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
        const memberships: IOrgMembership[] = [
          {
            organizationId: data.acceptInvitation.organizationId,
            role: ORG_ROLE_MAP[data.acceptInvitation.role],
          },
        ]
        setAbility(defineAbilityFor(memberships))
      }
      setPageState('success')
      setTimeout(() => navigate('/'), 1500)
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
      <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--brand-indigo-bright)_22%,transparent),transparent_60%)]"
        />
        <ThemeToggle />
        <m.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: easeSoft }}
          className="relative z-10 w-full max-w-sm"
        >
          <GlassCard glow="indigo">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MailCheck className="size-5" aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-display-md">{t('acceptInvite.title')}</CardTitle>
              <CardDescription>{t('acceptInvite.loginPrompt')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <AuthSubmitButton
                type="button"
                onClick={() =>
                  navigate(`${ROUTES.REGISTER}?returnTo=${encodeURIComponent(returnTo)}`)
                }
              >
                {t('acceptInvite.createAccount')}
              </AuthSubmitButton>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`)
                }
              >
                {t('acceptInvite.logIn')}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t('acceptInvite.emailHint')}
              </p>
            </CardContent>
          </GlassCard>
        </m.div>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--brand-indigo-bright)_22%,transparent),transparent_60%)]"
      />
      <ThemeToggle />
      <m.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.3, ease: easeSoft }}
        className="relative z-10 w-full max-w-sm"
      >
        <GlassCard glow={pageState === 'success' ? 'magenta' : 'indigo'}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MailCheck className="size-5" aria-hidden="true" />
            </div>
            <CardTitle className="font-display text-display-md">{t('acceptInvite.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {(pageState === 'idle' || pageState === 'accepting') && (
              <>
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{t('acceptInvite.accepting')}</p>
              </>
            )}
            {pageState === 'success' && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="size-6 text-status-live" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{t('acceptInvite.accepted')}</p>
              </div>
            )}
            {pageState === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertDescription>{t('acceptInvite.error')}</AlertDescription>
              </Alert>
            )}
            {pageState === 'mismatch' && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="size-4" aria-hidden="true" />
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
        </GlassCard>
      </m.div>
    </main>
  )
}
