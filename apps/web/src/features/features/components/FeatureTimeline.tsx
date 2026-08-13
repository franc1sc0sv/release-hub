import { useTranslation } from 'react-i18next'
import { ArrowRight, History } from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { CardContent } from '@/components/ui/card'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { featureStateTone } from '../constants/feature-enums'
import { FeatureTimelineScopeValue } from '../constants/feature-timeline-enums'
import type { GetFeatureQuery } from '@/generated/graphql'

type TimelineEntry = GetFeatureQuery['getFeature']['timeline'][number]

interface FeatureTimelineProps {
  timeline: TimelineEntry[]
}

function formatOccurredAt(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function FeatureTimeline({ timeline }: FeatureTimelineProps) {
  const { t } = useTranslation('features')
  const enumLabels = useEnumLabels()

  if (timeline.length === 0) {
    return (
      <GlassCard>
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <div className="flex size-11 items-center justify-center rounded-full bg-indigo-500/15">
            <History className="size-5 text-indigo-400" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">{t('detail.timeline.empty')}</p>
        </CardContent>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <CardContent className="py-5">
        <ol className="space-y-4">
          {timeline.map((entry, index) => (
            <li key={entry.id} className="relative flex gap-3 pl-1">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-indigo-400" aria-hidden />
                {index < timeline.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-white/10" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.fromState && (
                    <>
                      <StatusBadge tone={featureStateTone(entry.fromState)}>
                        {enumLabels.featureState(entry.fromState)}
                      </StatusBadge>
                      <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
                    </>
                  )}
                  <StatusBadge tone={featureStateTone(entry.toState)}>
                    {enumLabels.featureState(entry.toState)}
                  </StatusBadge>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="text-foreground/70">
                    {entry.scope === FeatureTimelineScopeValue.RELEASE
                      ? (entry.releaseName ?? t('detail.timeline.scopeRelease'))
                      : t('detail.timeline.scopeFeature')}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{enumLabels.featureTimelineSource(entry.source)}</span>
                  {entry.flagKey && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-foreground/70">
                      {entry.flagKey}
                    </span>
                  )}
                  {entry.actorName && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{t('detail.timeline.by', { name: entry.actorName })}</span>
                    </>
                  )}
                  <span aria-hidden>·</span>
                  <time dateTime={entry.occurredAt}>{formatOccurredAt(entry.occurredAt)}</time>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </GlassCard>
  )
}
