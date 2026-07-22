import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { m, AnimatePresence, useReducedMotion } from 'motion/react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { GradientButton } from '@/components/nebula/GradientButton'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { staggerContainer, slideUp } from '@/lib/animations'
import type { SummaryProfilesQuery } from '@/generated/graphql'
import { useSummaryProfiles } from '../hooks/use-summary-profiles'
import { SummaryProfileDialog } from './summary-profile-dialog'

type SummaryProfileListItem = SummaryProfilesQuery['summaryProfiles'][number]

interface SummaryProfilesSectionProps {
  projectId: string
}

export function SummaryProfilesSection({ projectId }: SummaryProfilesSectionProps) {
  const { t } = useTranslation('summaryProfiles')
  const reduceMotion = useReducedMotion()
  const { profiles, loading, removeProfile } = useSummaryProfiles(projectId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<SummaryProfileListItem | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const containerVariants = reduceMotion ? undefined : staggerContainer
  const itemVariants = reduceMotion ? undefined : slideUp

  function openCreateDialog(): void {
    setEditingProfile(null)
    setDialogOpen(true)
  }

  function openEditDialog(profile: SummaryProfileListItem): void {
    setEditingProfile(profile)
    setDialogOpen(true)
  }

  return (
    <>
      <GlassCard>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="size-4 text-muted-foreground" />
            {t('sections.title')}
          </CardTitle>
          <Can I={Action.UPDATE} a={Subject.SUMMARY_PROFILE}>
            <GradientButton size="sm" onClick={openCreateDialog}>
              <Plus className="size-4" />
              {t('list.create')}
            </GradientButton>
          </Can>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-[var(--radius-card)]" />
              ))}
            </div>
          )}

          {!loading && profiles.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8">
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('list.empty')}</p>
            </div>
          )}

          {profiles.length > 0 && (
            <m.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence>
                {profiles.map((profile) => (
                  <m.div
                    key={profile.id}
                    variants={itemVariants}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }
                    }
                    layout={!reduceMotion}
                    className="flex items-start justify-between gap-3 rounded-[var(--radius-card)] border border-border/60 bg-white/[0.02] p-4"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {profile.name}
                      </p>
                      {profile.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {profile.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="rounded-full border-border/60 bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          {t('list.ruleCount', { count: profile.rules.length })}
                        </Badge>
                        <Badge className="rounded-full border-border/60 bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          {t('list.exampleCount', { count: profile.examples.length })}
                        </Badge>
                      </div>
                    </div>

                    <Can I={Action.UPDATE} a={Subject.SUMMARY_PROFILE}>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditDialog(profile)}
                          aria-label={t('list.editAria', { name: profile.name })}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setPendingDeleteId(profile.id)}
                          aria-label={t('list.deleteAria', { name: profile.name })}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </Can>
                  </m.div>
                ))}
              </AnimatePresence>
            </m.div>
          )}
        </CardContent>
      </GlassCard>

      <SummaryProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectId={projectId}
        profile={editingProfile}
      />

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('dialog.deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (!pendingDeleteId) return
                const deletingId = pendingDeleteId
                setPendingDeleteId(null)
                try {
                  await removeProfile(deletingId)
                } catch {
                  toast.error(t('toast.deleteError'))
                }
              }}
            >
              {t('list.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
