import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Ban, Shield } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { GlassCard } from '@/components/nebula/GlassCard'
import { Can, useAbility } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { cn } from '@/lib/utils'
import type { GetBranchCleanupCandidatesQuery } from '@/generated/graphql'
import { BranchSignalChips } from './BranchSignalChips'
import { BlockBranchDialog } from './BlockBranchDialog'

type BranchCandidate = GetBranchCleanupCandidatesQuery['branchCleanupCandidates'][number]

interface BranchCleanupTableProps {
  projectId: string
  candidates: BranchCandidate[]
  selected: Set<string>
  onToggle: (branchName: string) => void
}

function isLocked(candidate: BranchCandidate): boolean {
  return candidate.signals.blocked || candidate.signals.isDefault || candidate.protected
}

export function BranchCleanupTable({
  projectId,
  candidates,
  selected,
  onToggle,
}: BranchCleanupTableProps) {
  const { t } = useTranslation('repoOps')
  const ability = useAbility()
  const canManageBranches = ability.can(Action.MANAGE, Subject.PROJECT)

  return (
    <GlassCard className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {canManageBranches && <TableHead className="w-10" />}
            <TableHead className="text-overline uppercase text-muted-foreground">
              {t('table.columns.branch')}
            </TableHead>
            <TableHead className="text-overline uppercase text-muted-foreground">
              {t('table.columns.lastActivity')}
            </TableHead>
            <TableHead className="text-overline uppercase text-muted-foreground">
              {t('table.columns.signals')}
            </TableHead>
            <TableHead className="w-10 text-right text-overline uppercase text-muted-foreground">
              {t('table.columns.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => {
            const locked = isLocked(candidate)
            const isSelected = selected.has(candidate.name)

            return (
              <TableRow
                key={candidate.name}
                className={cn(
                  'border-border/40 transition-colors hover:bg-accent/40',
                  candidate.suggested && !locked && 'bg-amber-500/5',
                )}
              >
                {canManageBranches && (
                  <TableCell>
                    {locked ? (
                      <span className="flex size-4 items-center justify-center text-muted-foreground">
                        {candidate.signals.blocked ? (
                          <Ban className="size-3.5" aria-hidden />
                        ) : (
                          <Shield className="size-3.5" aria-hidden />
                        )}
                      </span>
                    ) : (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggle(candidate.name)}
                        aria-label={t('table.selectBranch', { branchName: candidate.name })}
                      />
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm text-foreground">
                      {candidate.name}
                    </span>
                    {candidate.suggested && !locked && (
                      <span className="text-overline shrink-0 uppercase text-amber-400">
                        {t('table.suggested')}
                      </span>
                    )}
                    {locked && (
                      <span className="text-overline shrink-0 uppercase text-muted-foreground">
                        {candidate.signals.blocked
                          ? t('table.lockedBlocked')
                          : candidate.signals.isDefault
                            ? t('table.lockedDefault')
                            : t('table.lockedProtected')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {candidate.lastCommitDate
                    ? format(new Date(candidate.lastCommitDate), 'MMM d, yyyy')
                    : t('table.unknownActivity')}
                </TableCell>
                <TableCell>
                  <BranchSignalChips signals={candidate.signals} />
                </TableCell>
                <TableCell className="text-right">
                  {!locked && (
                    <Can I={Action.MANAGE} a={Subject.PROJECT}>
                      <BlockBranchDialog projectId={projectId} branchName={candidate.name} />
                    </Can>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </GlassCard>
  )
}
