import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@apollo/client/react'
import { CircleDashed, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Action, Subject } from '@release-hub/shared'
import { Can } from '@/context/ability.context'
import { GlassCard } from '@/components/nebula/GlassCard'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { ReleaseSectionHeading } from './ReleaseSectionHeading'
import { RELEASE_LINEAR_SYNC } from '../graphql/releases.queries'
import { SYNC_RELEASE_TO_LINEAR } from '../graphql/releases.mutations'
import {
  LINEAR_SYNC_KIND_ORDER,
  LINEAR_SYNC_STATUS_TONE,
  LinearSyncActionKindValue,
  LinearSyncActionStatusValue,
} from '../constants/linear-sync-enums'
import type { LinearSyncActionKind, ReleaseLinearSyncQuery } from '@/generated/graphql'

type LinearSyncAction = ReleaseLinearSyncQuery['releaseLinearSync'][number]

const KIND_TITLE_KEY: Record<LinearSyncActionKind, string> = {
  [LinearSyncActionKindValue.MOVE_TO_PRODUCTION]: 'workspace.linear.groups.status',
  [LinearSyncActionKindValue.FLAG_LABEL]: 'workspace.linear.groups.flags',
}

const STATUS_LABEL_KEY = {
  [LinearSyncActionStatusValue.DONE]: 'workspace.linear.status.done',
  [LinearSyncActionStatusValue.SKIPPED]: 'workspace.linear.status.skipped',
  [LinearSyncActionStatusValue.FAILED]: 'workspace.linear.status.failed',
} as const

interface LinearSyncRowProps {
  action: LinearSyncAction
}

function LinearSyncRow({ action }: LinearSyncRowProps) {
  const { t } = useTranslation('releases')

  return (
    <li className="flex flex-wrap items-start gap-x-4 gap-y-1 border-t border-white/6 px-5 py-3 first:border-t-0">
      <span className="w-28 shrink-0 font-mono text-sm font-medium text-foreground">{action.issueIdentifier}</span>
      <p className="min-w-0 flex-1 break-words text-sm text-muted-foreground">{action.detail}</p>
      <StatusBadge tone={LINEAR_SYNC_STATUS_TONE[action.status]}>{t(STATUS_LABEL_KEY[action.status])}</StatusBadge>
    </li>
  )
}

interface LinearSyncSectionProps {
  releaseId: string
  projectId: string
  isDeployed: boolean
}

export function LinearSyncSection({ releaseId, projectId, isDeployed }: LinearSyncSectionProps) {
  const { t } = useTranslation('releases')
  const { data, loading } = useQuery(RELEASE_LINEAR_SYNC, {
    variables: { releaseId },
    fetchPolicy: 'cache-and-network',
  })
  const [syncToLinear, { loading: syncing }] = useMutation(SYNC_RELEASE_TO_LINEAR, {
    refetchQueries: [{ query: RELEASE_LINEAR_SYNC, variables: { releaseId } }],
  })

  const handleSync = useCallback(async () => {
    try {
      const { data: result } = await syncToLinear({ variables: { projectId, releaseId } })
      const failed = (result?.syncReleaseToLinear ?? []).filter(
        (action) => action.status === LinearSyncActionStatusValue.FAILED,
      ).length
      if (failed > 0) {
        toast.error(t('workspace.linear.failedCount', { count: failed }))
      } else {
        toast.success(t('workspace.linear.synced'))
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('workspace.linear.error'))
    }
  }, [syncToLinear, projectId, releaseId, t])

  const actions = data?.releaseLinearSync ?? []
  const groups = LINEAR_SYNC_KIND_ORDER.map((kind) => ({
    kind,
    items: actions.filter((action) => action.kind === kind),
  })).filter((group) => group.items.length > 0)

  return (
    <section aria-labelledby="release-linear-heading" className="space-y-5">
      <ReleaseSectionHeading
        id="release-linear-heading"
        title={t('workspace.sections.linear')}
        description={t('workspace.linear.description')}
        actions={
          <Can I={Action.UPDATE} a={Subject.RELEASE}>
            <Button
              variant="outline"
              size="sm"
              disabled={!isDeployed || syncing}
              onClick={handleSync}
              className="gap-1.5"
            >
              {syncing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-3.5" aria-hidden />
              )}
              {syncing ? t('workspace.linear.syncing') : t('workspace.linear.syncButton')}
            </Button>
          </Can>
        }
      />

      {!loading && actions.length === 0 && (
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <CircleDashed className="size-7 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {isDeployed ? t('workspace.linear.empty') : t('workspace.linear.notDeployed')}
            </p>
          </CardContent>
        </GlassCard>
      )}

      {groups.map((group) => (
        <GlassCard key={group.kind} className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3">
            <p className="text-sm font-medium text-foreground">{t(KIND_TITLE_KEY[group.kind])}</p>
            <span className="font-mono text-xs text-muted-foreground">{group.items.length}</span>
          </div>
          <ul>
            {group.items.map((action) => (
              <LinearSyncRow key={action.id} action={action} />
            ))}
          </ul>
        </GlassCard>
      ))}
    </section>
  )
}
