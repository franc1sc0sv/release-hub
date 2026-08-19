import { useTranslation } from 'react-i18next'
import { Activity } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FlagActivityFilterOption } from '../constants/flag-enums'
import type { FlagActivityFilterOptionValue } from '../constants/flag-enums'
import type { FlagActivityFilter } from '@/generated/graphql'

interface FlagActivityFilterMenuProps {
  selected: FlagActivityFilter | undefined
  onChange: (value: FlagActivityFilter | undefined) => void
}

const ACTIVITY_FILTERS: FlagActivityFilter[] = [
  FlagActivityFilterOption.ACTIVE,
  FlagActivityFilterOption.INACTIVE,
]

export function FlagActivityFilterMenu({ selected, onChange }: FlagActivityFilterMenuProps) {
  const { t } = useTranslation('flags')
  const enumLabels = useEnumLabels()

  function select(value: FlagActivityFilterOptionValue) {
    onChange(value === FlagActivityFilterOption.ALL ? undefined : value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' gap-2'}>
        <Activity className="size-4" aria-hidden />
        {t('filters.activity.button')}
        {selected && (
          <span className="rounded-full bg-brand-indigo-bright/20 px-1.5 text-xs text-brand-indigo-bright">
            {enumLabels.flagActivityFilter(selected)}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('filters.activity.label')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selected ?? FlagActivityFilterOption.ALL}
            onValueChange={select}
          >
            <DropdownMenuRadioItem value={FlagActivityFilterOption.ALL}>
              {t('filters.activity.all')}
            </DropdownMenuRadioItem>
            {ACTIVITY_FILTERS.map((activity) => (
              <DropdownMenuRadioItem key={activity} value={activity}>
                {enumLabels.flagActivityFilter(activity)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
