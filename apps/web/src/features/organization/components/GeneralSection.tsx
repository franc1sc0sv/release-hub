import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@apollo/client/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Building2, Loader2, Lock, Trash2 } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useOrganization } from '@/context/organization.context'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { GqlOrgRole } from '@/features/collaboration/constants'
import { UPDATE_ORGANIZATION, DELETE_ORGANIZATION } from '../graphql/organization.operations'

export function GeneralSection() {
  const { t } = useTranslation('organization')
  const enumLabels = useEnumLabels()
  const navigate = useNavigate()
  const { activeOrg, refetch } = useOrganization()

  const isOwner = activeOrg?.role === GqlOrgRole.OWNER
  const [name, setName] = useState('')

  useEffect(() => {
    setName(activeOrg?.name ?? '')
  }, [activeOrg?.id, activeOrg?.name])

  const [updateOrganization, { loading: renaming }] = useMutation(UPDATE_ORGANIZATION, {
    onCompleted() {
      toast.success(t('general.renameSuccess'))
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  const [deleteOrganization, { loading: deleting }] = useMutation(DELETE_ORGANIZATION, {
    async onCompleted() {
      toast.success(t('danger.deleteSuccess'))
      await refetch()
      navigate('/', { replace: true })
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  function handleRename(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const trimmed = name.trim()
    if (!activeOrg || !trimmed || trimmed === activeOrg.name) return
    updateOrganization({ variables: { input: { organizationId: activeOrg.id, name: trimmed } } })
  }

  if (!activeOrg) return null

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base font-semibold">
            <span className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              {t('general.title')}
            </span>
            <Badge variant="outline" className="rounded-full">
              {enumLabels.orgRole(activeOrg.role)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRename} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="organization-name">{t('general.nameLabel')}</Label>
              <Input
                id="organization-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                required
              />
            </div>
            {isOwner && (
              <Button
                type="submit"
                disabled={renaming || !name.trim() || name.trim() === activeOrg.name}
              >
                {renaming ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t('general.saving')}
                  </>
                ) : (
                  t('general.save')
                )}
              </Button>
            )}
          </form>
          {!isOwner && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden />
              {t('general.readOnly')}
            </p>
          )}
        </CardContent>
      </GlassCard>

      {isOwner && (
        <GlassCard className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-destructive">
              {t('danger.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{t('danger.description')}</p>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" disabled={deleting} />}>
                <Trash2 className="mr-2 size-4" aria-hidden />
                {t('danger.delete')}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('danger.confirmTitle', { name: activeOrg.name })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>{t('danger.confirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('danger.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() =>
                      deleteOrganization({ variables: { organizationId: activeOrg.id } })
                    }
                  >
                    {t('danger.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </GlassCard>
      )}
    </div>
  )
}
