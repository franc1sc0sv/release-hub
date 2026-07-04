import { useTranslation } from 'react-i18next'
import { ListFilter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FLAG_DEPLOYMENT_STATUS_OPTIONS } from '../constants/flag-enums'
import type { FlagDeploymentStatus } from '@/generated/graphql'

interface FlagStatusFilterMenuProps {
  selected: FlagDeploymentStatus[]
  onChange: (statuses: FlagDeploymentStatus[]) => void
}

export function FlagStatusFilterMenu({ selected, onChange }: FlagStatusFilterMenuProps) {
  const { t } = useTranslation('flags')
  const enumLabels = useEnumLabels()

  function toggle(status: FlagDeploymentStatus, checked: boolean) {
    onChange(checked ? [...selected, status] : selected.filter((s) => s !== status))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' gap-2'}>
        <ListFilter className="size-4" aria-hidden />
        {t('filters.status.button')}
        {selected.length > 0 && (
          <span className="rounded-full bg-brand-indigo-bright/20 px-1.5 font-mono text-xs text-brand-indigo-bright">
            {selected.length}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('filters.status.label')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FLAG_DEPLOYMENT_STATUS_OPTIONS.map((status) => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={selected.includes(status)}
              onCheckedChange={(checked) => toggle(status, checked)}
            >
              {enumLabels.flagDeploymentStatus(status)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
