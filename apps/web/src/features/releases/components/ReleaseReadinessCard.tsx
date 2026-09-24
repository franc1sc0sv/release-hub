import { useTranslation } from 'react-i18next'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent } from '@/components/ui/card'
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { IReleaseWorkspaceStats } from '../hooks/useReleaseWorkspaceStats'

interface ReadinessRowProps {
  label: string
  done: number
  total: number
  indicatorClassName: string
}

function ReadinessRow({ label, done, total, indicatorClassName }: ReadinessRowProps) {
  const percent = total === 0 ? 100 : Math.round((done / total) * 100)

  return (
    <Progress value={percent} className="gap-1.5">
      <ProgressLabel className="text-xs font-normal text-foreground/80">{label}</ProgressLabel>
      <ProgressValue className="font-mono text-xs text-foreground">
        {() => `${done}/${total}`}
      </ProgressValue>
      <ProgressTrack className="h-1.5 bg-white/8">
        <ProgressIndicator className={cn('rounded-full', indicatorClassName)} />
      </ProgressTrack>
    </Progress>
  )
}

interface ReleaseReadinessCardProps {
  stats: IReleaseWorkspaceStats
}

export function ReleaseReadinessCard({ stats }: ReleaseReadinessCardProps) {
  const { t } = useTranslation('releases')

  return (
    <GlassCard>
      <CardContent className="space-y-4 py-4">
        <p className="text-overline uppercase tracking-widest text-muted-foreground">
          {t('workspace.readiness.title')}
        </p>
        <ReadinessRow
          label={t('workspace.readiness.coverage')}
          done={stats.coverage.assigned}
          total={stats.coverage.total}
          indicatorClassName={stats.coverage.ready ? 'bg-emerald-400' : 'bg-indigo-400'}
        />
        <ReadinessRow
          label={t('workspace.readiness.flagDecisions')}
          done={stats.flagDecisionsDecided}
          total={stats.flagDecisionsTotal}
          indicatorClassName={
            stats.flagDecisionsDecided === stats.flagDecisionsTotal ? 'bg-emerald-400' : 'bg-amber-400'
          }
        />
        <ReadinessRow
          label={t('workspace.readiness.liveForClients')}
          done={stats.liveProductCount}
          total={stats.productCount}
          indicatorClassName="bg-brand-indigo-bright"
        />
      </CardContent>
    </GlassCard>
  )
}
