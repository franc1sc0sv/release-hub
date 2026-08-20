import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, generatePath, useParams } from 'react-router-dom'
import { m, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'
import { GlassCard } from '@/components/nebula/GlassCard'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/routes'
import { fadeIn } from '@/lib/animations'
import type { FlagSortField, SortDirection, GetFlagsQuery } from '@/generated/graphql'
import { EnvStateCell } from './EnvStateCell'
import { FlagStaleBadge } from './FlagStaleBadge'
import { FlagDeploymentStatusBadge } from './FlagDeploymentStatusBadge'

type FlagItem = GetFlagsQuery['getFlags']['items'][number]

interface FlagMatrixProps {
  items: FlagItem[]
  totalCount: number
  visibleEnvironments: string[]
  sortField: FlagSortField
  sortDirection: SortDirection
  onSortChange: (field: FlagSortField, envName?: string) => void
  activeSortEnv?: string
}

interface SortableHeaderProps {
  label: string
  field: FlagSortField
  envName?: string
  activeSortField: FlagSortField
  activeSortEnv?: string
  sortDirection: SortDirection
  onSort: (field: FlagSortField, envName?: string) => void
}

function SortableHeader({
  label,
  field,
  envName,
  activeSortField,
  activeSortEnv,
  sortDirection,
  onSort,
}: SortableHeaderProps) {
  const isActive =
    activeSortField === field &&
    (field !== 'ENVIRONMENT' || activeSortEnv === envName)

  const Icon = isActive
    ? sortDirection === 'ASC'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 font-medium text-muted-foreground hover:text-foreground data-[active=true]:text-foreground"
      data-active={isActive}
      onClick={() => onSort(field, envName)}
    >
      {label}
      <Icon className="size-3.5 shrink-0" aria-hidden />
    </Button>
  )
}

interface FlagRowProps {
  flag: FlagItem
  visibleEnvironments: string[]
  onLabel: string
  offLabel: string
}

const FlagRow = memo(function FlagRow({
  flag,
  visibleEnvironments,
  onLabel,
  offLabel,
}: FlagRowProps) {
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>()
  const formattedDate = flag.createdAt
    ? format(new Date(flag.createdAt), 'MMM d, yyyy')
    : null

  const environmentsByName = useMemo(() => {
    const map = new Map<string, FlagItem['environments'][number]>()
    for (const env of flag.environments) {
      map.set(env.name, env)
    }
    return map
  }, [flag.environments])

  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 bg-card pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={generatePath(ROUTES.PROJECT_FLAG_DETAIL, {
              organizationId: organizationId ?? '',
              projectId: projectId ?? '',
              flagKey: flag.key,
            })}
            className="font-mono text-sm font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {flag.key}
          </Link>
          <FlagStaleBadge createdAt={flag.createdAt} />
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground font-mono">
        {formattedDate ?? '—'}
      </TableCell>
      <TableCell>
        <FlagDeploymentStatusBadge status={flag.deploymentStatus} />
      </TableCell>
      {visibleEnvironments.map((env) => {
        const state = environmentsByName.get(env)
        return (
          <TableCell key={env}>
            <EnvStateCell enabled={state?.enabled ?? false} onLabel={onLabel} offLabel={offLabel} />
          </TableCell>
        )
      })}
    </TableRow>
  )
})

export function FlagMatrix({
  items,
  totalCount,
  visibleEnvironments,
  sortField,
  sortDirection,
  onSortChange,
  activeSortEnv,
}: FlagMatrixProps) {
  const { t } = useTranslation('flags')
  const reduceMotion = useReducedMotion()
  const onLabel = t('state.on')
  const offLabel = t('state.off')

  return (
    <m.div variants={reduceMotion ? undefined : fadeIn} initial="hidden" animate="visible">
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-display text-lg font-semibold">{t('title')}</CardTitle>
            <span className="rounded-full bg-muted/60 px-3 py-1 font-mono text-sm text-muted-foreground">
              {t('matrix.count', { count: totalCount })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20 bg-card pl-6">
                  <SortableHeader
                    label={t('matrix.flag')}
                    field="NAME"
                    activeSortField={sortField}
                    activeSortEnv={activeSortEnv}
                    sortDirection={sortDirection}
                    onSort={onSortChange}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label={t('matrix.created')}
                    field="CREATED"
                    activeSortField={sortField}
                    activeSortEnv={activeSortEnv}
                    sortDirection={sortDirection}
                    onSort={onSortChange}
                  />
                </TableHead>
                <TableHead className="font-medium text-muted-foreground">{t('matrix.status')}</TableHead>
                {visibleEnvironments.map((env) => (
                  <TableHead key={env}>
                    <SortableHeader
                      label={env}
                      field="ENVIRONMENT"
                      envName={env}
                      activeSortField={sortField}
                      activeSortEnv={activeSortEnv}
                      sortDirection={sortDirection}
                      onSort={onSortChange}
                    />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((flag) => (
                <FlagRow
                  key={flag.key}
                  flag={flag}
                  visibleEnvironments={visibleEnvironments}
                  onLabel={onLabel}
                  offLabel={offLabel}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </GlassCard>
    </m.div>
  )
}
