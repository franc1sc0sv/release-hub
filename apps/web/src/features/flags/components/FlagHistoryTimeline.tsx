import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Code2,
  FileCode,
  GitBranch,
  PenLine,
  PlusCircle,
  RadarIcon,
  RefreshCw,
  Rocket,
  ShieldOff,
  Trash2,
} from 'lucide-react'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { ROUTES } from '@/lib/routes'
import { FlagHistoryEventTypeValue, flagHistorySourceTone } from '../constants/flag-enums'
import { useFlagHistory } from '../hooks/use-flag-history'
import type { FlagHistoryEventType, GetFlagHistoryQuery } from '@/generated/graphql'

type FlagHistoryEvent = GetFlagHistoryQuery['flagHistory']['items'][number]

const EVENT_ICON: Record<FlagHistoryEventType, LucideIcon> = {
  [FlagHistoryEventTypeValue.FLAG_CREATED]: PlusCircle,
  [FlagHistoryEventTypeValue.FLAG_DELETED]: Trash2,
  [FlagHistoryEventTypeValue.FLAG_ENABLED]: CheckCircle2,
  [FlagHistoryEventTypeValue.FLAG_DISABLED]: CircleDashed,
  [FlagHistoryEventTypeValue.FLAG_VALUE_CHANGED]: PenLine,
  [FlagHistoryEventTypeValue.DECISION_ENABLE_IN_RELEASE]: Rocket,
  [FlagHistoryEventTypeValue.DECISION_SHIP_OFF]: ShieldOff,
  [FlagHistoryEventTypeValue.DECISION_IN_PROGRESS]: CircleDashed,
  [FlagHistoryEventTypeValue.CONFLICT_DETECTED]: AlertTriangle,
  [FlagHistoryEventTypeValue.REMINDER_SENT]: BellRing,
  [FlagHistoryEventTypeValue.SYNC_COMPLETED]: RefreshCw,
  [FlagHistoryEventTypeValue.COVERAGE_SCAN]: RadarIcon,
  [FlagHistoryEventTypeValue.DETECTED_DEFINITION]: FileCode,
  [FlagHistoryEventTypeValue.DETECTED_USAGE]: Code2,
  [FlagHistoryEventTypeValue.FIRST_SEEN_BRANCH]: GitBranch,
}

const PAGE_SIZE = 50

interface FlagHistoryRowProps {
  event: FlagHistoryEvent
}

function FlagHistoryRow({ event }: FlagHistoryRowProps) {
  const { t, i18n } = useTranslation('flags')
  const enumLabels = useEnumLabels()
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()
  const locale = i18n.language.startsWith('es') ? es : enUS
  const Icon = EVENT_ICON[event.type]
  const hasValueChange = event.previousValue !== null || event.newValue !== null
  const releaseDetailPath = (releaseId: string) =>
    generatePath(ROUTES.PROJECT_RELEASE_DETAIL, {
      organizationId: organizationId ?? '',
      projectId: projectId ?? '',
      releaseId,
    })

  return (
    <li className="flex items-start gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
        <Icon className="size-4 text-indigo-400" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {enumLabels.flagHistoryEventType(event.type)}
          </span>
          {event.environmentName && (
            <span className="font-mono text-xs text-muted-foreground">{event.environmentName}</span>
          )}
          {event.branchName && (
            <span className="font-mono text-xs text-muted-foreground">{event.branchName}</span>
          )}
        </div>
        {hasValueChange && (
          <p className="font-mono text-xs text-muted-foreground">
            {t('detail.history.event.valueChange', {
              previous: event.previousValue ?? '—',
              next: event.newValue ?? '—',
            })}
          </p>
        )}
        {event.detectedFile && (
          <p className="truncate font-mono text-xs text-muted-foreground">{event.detectedFile}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StatusBadge tone={flagHistorySourceTone(event.source)}>
            {enumLabels.flagHistorySource(event.source)}
          </StatusBadge>
          {event.actorName && <span>{event.actorName}</span>}
          {event.prNumber !== null &&
            (event.releaseId ? (
              <Link
                to={{
                  pathname: releaseDetailPath(event.releaseId),
                  search: '?section=flags',
                }}
                className="font-mono underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                #{event.prNumber}
              </Link>
            ) : (
              <span className="font-mono">#{event.prNumber}</span>
            ))}
          {event.releaseName &&
            (event.releaseId ? (
              <Link
                to={{
                  pathname: releaseDetailPath(event.releaseId),
                  search: '?section=flags',
                }}
                className="font-mono underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {event.releaseName}
              </Link>
            ) : (
              <span className="font-mono">{event.releaseName}</span>
            ))}
          <time dateTime={event.occurredAt} className="font-mono">
            {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true, locale })}
          </time>
        </div>
      </div>
    </li>
  )
}

interface FlagHistoryTimelineProps {
  projectId: string
  flagKey: string
}

export function FlagHistoryTimeline({ projectId, flagKey }: FlagHistoryTimelineProps) {
  const { t } = useTranslation('flags')
  const [page, setPage] = useState(1)

  const { items, totalCount, loading } = useFlagHistory({
    projectId,
    flagKey,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="font-display text-base font-semibold">
          {t('detail.history.title')}
          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
            {totalCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-[var(--radius-card)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('detail.history.empty')}</p>
        ) : (
          <ul className="space-y-0">
            {items.map((event) => (
              <FlagHistoryRow key={event.id} event={event} />
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  onClick={page > 1 ? () => setPage((p) => p - 1) : undefined}
                  aria-disabled={page === 1}
                  aria-label={t('pagination.previous')}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  <span className="sr-only">{t('pagination.previous')}</span>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  {t('pagination.pageOf', { page, total: totalPages })}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={page < totalPages ? () => setPage((p) => p + 1) : undefined}
                  aria-disabled={page === totalPages}
                  aria-label={t('pagination.next')}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                >
                  <span className="sr-only">{t('pagination.next')}</span>
                  <ChevronRight className="size-4" aria-hidden />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </GlassCard>
  )
}
