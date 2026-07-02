import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Loader2, ShieldBan, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import type { GetBlockedBranchesQuery } from '@/generated/graphql'
import { useUnblockBranch } from '../hooks/use-unblock-branch'

type BlockedBranch = GetBlockedBranchesQuery['blockedBranches'][number]

interface BlockedBranchesCardProps {
  projectId: string
  blockedBranches: BlockedBranch[]
}

export function BlockedBranchesCard({ projectId, blockedBranches }: BlockedBranchesCardProps) {
  const { t } = useTranslation('repoOps')
  const { unblockBranch, loading } = useUnblockBranch(projectId)

  async function handleUnblock(branchName: string) {
    try {
      await unblockBranch({ variables: { input: { projectId, branchName } } })
      toast.success(t('blockedList.unblockSuccess', { branchName }))
    } catch {
      toast.error(t('blockedList.unblockError'))
    }
  }

  return (
    <GlassCard>
      <CardHeader className="flex flex-row items-center gap-2">
        <ShieldBan className="size-5 text-brand-indigo-bright" aria-hidden />
        <CardTitle className="font-display text-base">{t('blockedList.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {blockedBranches.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('blockedList.empty')}</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {blockedBranches.map((blocked) => (
              <li key={blocked.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-foreground">{blocked.branchName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {blocked.reason
                      ? t('blockedList.reasonWithDate', {
                          reason: blocked.reason,
                          date: format(new Date(blocked.createdAt), 'MMM d, yyyy'),
                        })
                      : t('blockedList.dateOnly', {
                          date: format(new Date(blocked.createdAt), 'MMM d, yyyy'),
                        })}
                  </p>
                </div>
                <Can I={Action.MANAGE} a={Subject.PROJECT}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    disabled={loading}
                    onClick={() => void handleUnblock(blocked.branchName)}
                  >
                    {loading ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Unlock className="size-3.5" aria-hidden />
                    )}
                    {t('blockedList.unblock')}
                  </Button>
                </Can>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  )
}
