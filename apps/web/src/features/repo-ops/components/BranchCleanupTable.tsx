import { useTranslation } from 'react-i18next'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { ArrowDown, ArrowUp, ArrowUpDown, Shield } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GlassCard } from '@/components/nebula/GlassCard'
import { StatusBadge, StatusBadgeTone } from '@/components/nebula/StatusBadge'
import { Can, useAbility } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { cn } from '@/lib/utils'
import type { BranchCleanupPageItemType, BranchCleanupSortField } from '@/generated/graphql'
import {
  BranchBlockReasonValue,
  isBranchRowSelectable,
  isOverridableBlockReasonSet,
} from '../constants/branch-block-reason'
import {
  BranchCleanupSortFieldValue,
  SIGNAL_SORT_FIELDS,
  SortDirectionValue,
  type IBranchSort,
} from '../constants/branch-sort'
import { BranchSignalChips } from './BranchSignalChips'
import { BranchReasonChips } from './BranchReasonChips'
import { UnprotectBranchDialog } from './UnprotectBranchDialog'
import { BlockBranchDialog } from './BlockBranchDialog'
import { UnblockBranchButton } from './UnblockBranchButton'

interface BranchCleanupTableProps {
  projectId: string
  items: BranchCleanupPageItemType[]
  selected: Set<string>
  overriddenBranches: Set<string>
  sort: IBranchSort | null
  onSortChange: (field: BranchCleanupSortField) => void
  onToggle: (item: BranchCleanupPageItemType) => void
  onToggleAll: (items: BranchCleanupPageItemType[], select: boolean) => void
  onUnprotect: (branchName: string) => void
}

function authorInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}

function sortIconFor(sort: IBranchSort | null, field: BranchCleanupSortField): typeof ArrowUpDown {
  if (sort?.field !== field) return ArrowUpDown
  return sort.direction === SortDirectionValue.DESC ? ArrowDown : ArrowUp
}

interface SortHeaderButtonProps {
  field: BranchCleanupSortField
  label: string
  sort: IBranchSort | null
  onSortChange: (field: BranchCleanupSortField) => void
  ariaLabel: string
}

function SortHeaderButton({ field, label, sort, onSortChange, ariaLabel }: SortHeaderButtonProps) {
  const active = sort?.field === field
  const Icon = sortIconFor(sort, field)
  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      aria-label={ariaLabel}
      className={cn(
        'flex items-center gap-1 text-overline uppercase transition-colors hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
      <Icon className="size-3.5" aria-hidden />
    </button>
  )
}

export function BranchCleanupTable({
  projectId,
  items,
  selected,
  overriddenBranches,
  sort,
  onSortChange,
  onToggle,
  onToggleAll,
  onUnprotect,
}: BranchCleanupTableProps) {
  const { t, i18n } = useTranslation('repoOps')
  const ability = useAbility()
  const canManageBranches = ability.can(Action.MANAGE, Subject.PROJECT)
  const locale = i18n.language.startsWith('es') ? es : enUS

  const selectableItems = items.filter((item) => isBranchRowSelectable(item, overriddenBranches.has(item.name)))
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selected.has(item.name))
  const someSelected = selectableItems.some((item) => selected.has(item.name))

  const activeSignalSort = sort && SIGNAL_SORT_FIELDS.includes(sort.field) ? sort : null
  const SignalsIcon = activeSignalSort
    ? sortIconFor(activeSignalSort, activeSignalSort.field)
    : ArrowUpDown

  return (
    <GlassCard className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {canManageBranches && (
              <TableHead className="w-10">
                {selectableItems.length > 0 && (
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onCheckedChange={(checked) => onToggleAll(selectableItems, checked === true)}
                    aria-label={t('table.selectAll')}
                  />
                )}
              </TableHead>
            )}
            <TableHead className="text-overline uppercase text-muted-foreground">
              {t('table.columns.branch')}
            </TableHead>
            <TableHead>
              <SortHeaderButton
                field={BranchCleanupSortFieldValue.LAST_ACTIVITY}
                label={t('table.columns.lastActivity')}
                sort={sort}
                onSortChange={onSortChange}
                ariaLabel={t('table.sort.aria', { label: t('table.columns.lastActivity') })}
              />
            </TableHead>
            <TableHead>
              <SortHeaderButton
                field={BranchCleanupSortFieldValue.AUTHOR}
                label={t('table.columns.author')}
                sort={sort}
                onSortChange={onSortChange}
                ariaLabel={t('table.sort.aria', { label: t('table.columns.author') })}
              />
            </TableHead>
            <TableHead>
              <SortHeaderButton
                field={BranchCleanupSortFieldValue.PROTECTED}
                label={t('table.columns.protection')}
                sort={sort}
                onSortChange={onSortChange}
                ariaLabel={t('table.sort.aria', { label: t('table.columns.protection') })}
              />
            </TableHead>
            <TableHead>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t('table.sort.aria', { label: t('table.columns.signals') })}
                  className={cn(
                    'flex items-center gap-1 text-overline uppercase transition-colors hover:text-foreground',
                    activeSignalSort ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t('table.columns.signals')}
                  <SignalsIcon className="size-3.5" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {SIGNAL_SORT_FIELDS.map((field) => {
                    const FieldIcon = sortIconFor(sort, field)
                    const active = sort?.field === field
                    return (
                      <DropdownMenuItem key={field} onClick={() => onSortChange(field)}>
                        <span className={cn('flex-1', active && 'text-foreground')}>
                          {t(`table.sortSignals.${field}`)}
                        </span>
                        {active && <FieldIcon className="size-3.5" aria-hidden />}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableHead>
            <TableHead className="w-10 text-right text-overline uppercase text-muted-foreground">
              {t('table.columns.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isOverridden = overriddenBranches.has(item.name)
            const isProtected = item.blockReasons.length > 0
            const isSelectable = isBranchRowSelectable(item, isOverridden)
            const isSelected = selected.has(item.name)
            const canUnprotect = isProtected && !isOverridden && isOverridableBlockReasonSet(item.blockReasons)
            const isManuallyBlocked = item.blockReasons.includes(BranchBlockReasonValue.MANUALLY_BLOCKED)
            const authorName = item.lastCommitAuthorLogin ?? item.lastCommitAuthorName

            return (
              <TableRow
                key={item.name}
                className={cn(
                  'border-border/40 transition-colors hover:bg-accent/40',
                  isProtected && !isOverridden && 'bg-brand-indigo-bright/5',
                )}
              >
                {canManageBranches && (
                  <TableCell>
                    {isSelectable ? (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggle(item)}
                        aria-label={t('table.selectBranch', { branchName: item.name })}
                      />
                    ) : (
                      <span
                        role="img"
                        aria-label={t('protected.shieldLabel')}
                        className="flex size-4 items-center justify-center text-muted-foreground"
                      >
                        <Shield className="size-3.5" aria-hidden />
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1.5">
                    <span className="truncate font-mono text-sm text-foreground">{item.name}</span>
                    {isProtected && <BranchReasonChips blockReasons={item.blockReasons} />}
                    {isOverridden && (
                      <p className="text-overline uppercase text-amber-400">{t('protected.unprotected')}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.lastCommitAt
                    ? formatDistanceToNow(new Date(item.lastCommitAt), { addSuffix: true, locale })
                    : '—'}
                </TableCell>
                <TableCell>
                  {authorName ? (
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        {item.lastCommitAuthorAvatarUrl && (
                          <AvatarImage src={item.lastCommitAuthorAvatarUrl} alt={authorName} />
                        )}
                        <AvatarFallback>{authorInitials(authorName)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm text-foreground">{authorName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {isProtected ? (
                    <StatusBadge tone={StatusBadgeTone.INDIGO} icon={Shield}>
                      {t('table.protectionBadge')}
                    </StatusBadge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <BranchSignalChips
                    signals={item.signals}
                    openPullRequestNumber={item.openPullRequestNumber}
                    openPullRequestUrl={item.openPullRequestUrl}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canUnprotect && (
                      <Can I={Action.MANAGE} a={Subject.PROJECT}>
                        <UnprotectBranchDialog
                          branchName={item.name}
                          blockReasons={item.blockReasons}
                          onConfirm={() => onUnprotect(item.name)}
                        />
                      </Can>
                    )}
                    {!item.isDefault && (
                      <Can I={Action.MANAGE} a={Subject.PROJECT}>
                        {isManuallyBlocked ? (
                          <UnblockBranchButton projectId={projectId} branchName={item.name} />
                        ) : (
                          <BlockBranchDialog projectId={projectId} branchName={item.name} />
                        )}
                      </Can>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </GlassCard>
  )
}
