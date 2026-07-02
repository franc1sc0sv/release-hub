import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { CheckCircle2, CircleDashed, Loader2, RadarIcon } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import type { TrackedFlagQuery } from '@/generated/graphql'

type TrackedFlagDetail = NonNullable<TrackedFlagQuery['trackedFlag']>
type FlagBranchPresence = TrackedFlagDetail['branchPresences'][number]

interface FlagBranchRowProps {
  branch: FlagBranchPresence
}

function FlagBranchRow({ branch }: FlagBranchRowProps) {
  const { t, i18n } = useTranslation('flags')
  const locale = i18n.language.startsWith('es') ? es : enUS

  return (
    <li className="flex flex-wrap items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0">
      {branch.present ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <CircleDashed className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
        {branch.branch}
      </span>
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {branch.present ? t('detail.branches.present') : t('detail.branches.absent')}
      </span>
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {t('detail.branches.firstSeen', {
          time: formatDistanceToNow(new Date(branch.firstSeenAt), { addSuffix: true, locale }),
        })}
      </span>
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {t('detail.branches.lastConfirmed', {
          time: formatDistanceToNow(new Date(branch.lastConfirmedAt), { addSuffix: true, locale }),
        })}
      </span>
    </li>
  )
}

interface FlagBranchPresenceSectionProps {
  branches: FlagBranchPresence[]
  onRescan: () => void
  rescanning: boolean
}

export function FlagBranchPresenceSection({
  branches,
  onRescan,
  rescanning,
}: FlagBranchPresenceSectionProps) {
  const { t } = useTranslation('flags')

  return (
    <GlassCard>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="font-display text-base font-semibold">
            {t('detail.branches.title')}
            <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
              {branches.length}
            </span>
          </CardTitle>
          <Can I={Action.UPDATE} a={Subject.PROJECT}>
            <Button variant="outline" size="sm" disabled={rescanning} onClick={onRescan}>
              {rescanning ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <RadarIcon className="size-3.5" aria-hidden />
              )}
              {t('detail.branches.rescan')}
            </Button>
          </Can>
        </div>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('detail.branches.empty')}
          </p>
        ) : (
          <ul className="space-y-0">
            {branches.map((branch) => (
              <FlagBranchRow key={branch.branch} branch={branch} />
            ))}
          </ul>
        )}
      </CardContent>
    </GlassCard>
  )
}
