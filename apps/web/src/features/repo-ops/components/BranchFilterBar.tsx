import { useTranslation } from 'react-i18next'
import { FilterX, ListFilter } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type {
  BranchActivityRange,
  BranchProtectionFilter,
  BranchSignalFilter,
} from '@/generated/graphql'
import {
  ACTIVITY_RANGE_OPTIONS,
  PROTECTION_FILTER_OPTIONS,
  SIGNAL_FILTER_OPTIONS,
} from '../constants/branch-filters'

const ALL_VALUE = 'ALL'

interface BranchFilterBarProps {
  authors: string[]
  authorFilter: string
  onAuthorChange: (value: string) => void
  activity: BranchActivityRange | null
  onActivityChange: (value: BranchActivityRange | null) => void
  protection: BranchProtectionFilter | null
  onProtectionChange: (value: BranchProtectionFilter | null) => void
  signalFilters: BranchSignalFilter[]
  onSignalsChange: (value: BranchSignalFilter[]) => void
}

export function BranchFilterBar({
  authors,
  authorFilter,
  onAuthorChange,
  activity,
  onActivityChange,
  protection,
  onProtectionChange,
  signalFilters,
  onSignalsChange,
}: BranchFilterBarProps) {
  const { t } = useTranslation('repoOps')

  const hasActiveFilters =
    authorFilter !== '' || activity !== null || protection !== null || signalFilters.length > 0

  function toggleSignal(signal: BranchSignalFilter, checked: boolean) {
    onSignalsChange(
      checked ? [...signalFilters, signal] : signalFilters.filter((current) => current !== signal),
    )
  }

  function clearAll() {
    onAuthorChange('')
    onActivityChange(null)
    onProtectionChange(null)
    onSignalsChange([])
  }

  return (
    <>
      <Select
        value={authorFilter || ALL_VALUE}
        onValueChange={(value) =>
          onAuthorChange(authors.find((author) => author === value) ?? '')
        }
      >
        <SelectTrigger className="w-48" aria-label={t('filters.authorAria')}>
          <SelectValue>
            {(value: string) => (value === ALL_VALUE ? t('filters.authorAll') : value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t('filters.authorAll')}</SelectItem>
          {authors.map((author) => (
            <SelectItem key={author} value={author}>
              {author}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={activity ?? ALL_VALUE}
        onValueChange={(value) =>
          onActivityChange(ACTIVITY_RANGE_OPTIONS.find((option) => option === value) ?? null)
        }
      >
        <SelectTrigger className="w-44" aria-label={t('filters.activityAria')}>
          <SelectValue>
            {(value: string) =>
              value === ALL_VALUE ? t('filters.activityAll') : t(`filters.activityOptions.${value}`)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t('filters.activityAll')}</SelectItem>
          {ACTIVITY_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`filters.activityOptions.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={protection ?? ALL_VALUE}
        onValueChange={(value) =>
          onProtectionChange(PROTECTION_FILTER_OPTIONS.find((option) => option === value) ?? null)
        }
      >
        <SelectTrigger className="w-44" aria-label={t('filters.protectionAria')}>
          <SelectValue>
            {(value: string) =>
              value === ALL_VALUE
                ? t('filters.protectionAll')
                : t(`filters.protectionOptions.${value}`)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{t('filters.protectionAll')}</SelectItem>
          {PROTECTION_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`filters.protectionOptions.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' gap-2'}>
          <ListFilter className="size-4" aria-hidden />
          {t('filters.signalsLabel')}
          {signalFilters.length > 0 && (
            <span className="font-mono text-xs text-brand-indigo-bright">{signalFilters.length}</span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {SIGNAL_FILTER_OPTIONS.map((signal) => (
            <DropdownMenuCheckboxItem
              key={signal}
              checked={signalFilters.includes(signal)}
              onCheckedChange={(checked) => toggleSignal(signal, checked === true)}
            >
              {t(`filters.signalOptions.${signal}`)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5">
          <FilterX className="size-4" aria-hidden />
          {t('filters.clear')}
        </Button>
      )}
    </>
  )
}
