import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { Link, generatePath, useParams } from 'react-router-dom'
import { AlertTriangle, Check, Loader2, X, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { ROUTES } from '@/lib/routes'
import { SET_RELEASE_FLAG_DECISION } from '../graphql/releases.mutations'
import { IN_PROGRESS_FLAG_REMINDERS } from '../graphql/releases.queries'
import { ReleaseFlagDecisionTypeValue } from '../constants/release-enums'
import type { InProgressFlagRemindersQuery, ReleaseFlagDecisionType } from '@/generated/graphql'

type ReminderItem = InProgressFlagRemindersQuery['inProgressFlagReminders'][number]

interface InProgressFlagRemindersPanelProps {
  releaseId: string
  projectId: string
  reminders: ReminderItem[]
}

interface ReminderRowProps {
  reminder: ReminderItem
  releaseId: string
  projectId: string
}

function ReminderRow({ reminder, releaseId, projectId }: ReminderRowProps) {
  const { t } = useTranslation('releases')
  const { organizationId } = useParams<{ organizationId: string }>()
  const [pendingDecision, setPendingDecision] = useState<ReleaseFlagDecisionType | null>(null)
  const [resolved, setResolved] = useState(false)

  const [setDecision] = useMutation(SET_RELEASE_FLAG_DECISION, {
    refetchQueries: [
      { query: IN_PROGRESS_FLAG_REMINDERS, variables: { projectId, excludeReleaseId: releaseId } },
    ],
  })

  const handleDecide = async (decision: ReleaseFlagDecisionType) => {
    setPendingDecision(decision)
    try {
      await setDecision({
        variables: { input: { releaseId, trackedFlagId: reminder.trackedFlagId, decision } },
      })
      toast.success(t('flags.toast.decisionSaved'))
      setResolved(true)
    } catch {
      toast.error(t('flags.toast.decisionError'))
    } finally {
      setPendingDecision(null)
    }
  }

  const formattedDecidedAt = reminder.decidedAt
    ? new Date(reminder.decidedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  if (resolved) return null

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1">
        <Link
          to={generatePath(ROUTES.PROJECT_FLAG_DETAIL, {
            organizationId: organizationId ?? '',
            projectId,
            flagKey: reminder.key,
          })}
          className="font-mono text-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {reminder.key}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>
            {t('flags.reminders.lastDecidedIn')}{' '}
            <span className="font-mono text-foreground/70">{reminder.releaseVersion}</span>
          </span>
          {formattedDecidedAt && (
            <span className="font-mono">{formattedDecidedAt}</span>
          )}
        </div>
      </div>

      <Can I={Action.UPDATE} a={Subject.RELEASE} passThrough>
        {(canDecide) =>
          canDecide && (
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 border-emerald-500/30 px-2.5 text-xs text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
                disabled={pendingDecision !== null}
                onClick={() => void handleDecide(ReleaseFlagDecisionTypeValue.ENABLE_IN_RELEASE)}
              >
                {pendingDecision === ReleaseFlagDecisionTypeValue.ENABLE_IN_RELEASE ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                ) : (
                  <Check className="size-3" aria-hidden />
                )}
                {t('flags.reminders.enable')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 border-rose-500/30 px-2.5 text-xs text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                disabled={pendingDecision !== null}
                onClick={() => void handleDecide(ReleaseFlagDecisionTypeValue.SHIP_OFF)}
              >
                {pendingDecision === ReleaseFlagDecisionTypeValue.SHIP_OFF ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                ) : (
                  <X className="size-3" aria-hidden />
                )}
                {t('flags.reminders.shipOff')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 border-white/15 px-2.5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
                disabled={pendingDecision !== null}
                onClick={() => void handleDecide(ReleaseFlagDecisionTypeValue.IN_PROGRESS)}
              >
                {pendingDecision === ReleaseFlagDecisionTypeValue.IN_PROGRESS ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                ) : (
                  <Clock className="size-3" aria-hidden />
                )}
                {t('flags.reminders.keepInProgress')}
              </Button>
            </div>
          )
        }
      </Can>
    </div>
  )
}

export function InProgressFlagRemindersPanel({
  releaseId,
  projectId,
  reminders,
}: InProgressFlagRemindersPanelProps) {
  const { t } = useTranslation('releases')

  if (reminders.length === 0) return null

  return (
    <GlassCard className="border-amber-500/25 bg-amber-500/[0.03]">
      <CardHeader className="flex flex-row items-center gap-2.5 pb-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
          <AlertTriangle className="size-4 text-amber-400" aria-hidden />
        </div>
        <div>
          <CardTitle className="font-display text-base font-semibold text-foreground">
            {t('flags.reminders.heading')}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t('flags.reminders.description', { count: reminders.length })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.map((reminder) => (
          <ReminderRow
            key={reminder.trackedFlagId}
            reminder={reminder}
            releaseId={releaseId}
            projectId={projectId}
          />
        ))}
      </CardContent>
    </GlassCard>
  )
}
