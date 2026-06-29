import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
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
import { slideUp } from '@/lib/animations'
import type { FlagSortField, SortDirection, GetFlagsQuery } from '@/generated/graphql'
import { EnvStateCell } from './EnvStateCell'
import { FlagStaleBadge } from './FlagStaleBadge'

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
}

function FlagRow({ flag, visibleEnvironments }: FlagRowProps) {
  const formattedDate = flag.createdAt
    ? format(new Date(flag.createdAt), 'MMM d, yyyy')
    : null

  return (
    <motion.tr
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="border-b transition-colors hover:bg-muted/50"
    >
      <TableCell className="pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium text-foreground">{flag.key}</span>
          <FlagStaleBadge createdAt={flag.createdAt} />
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground font-mono">
        {formattedDate ?? '—'}
      </TableCell>
      {visibleEnvironments.map((env) => {
        const state = flag.environments.find((e) => e.name === env)
        return (
          <TableCell key={env}>
            <EnvStateCell enabled={state?.enabled ?? false} />
          </TableCell>
        )
      })}
    </motion.tr>
  )
}

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

  return (
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">
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
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </GlassCard>
  )
}
