import { useTranslation } from 'react-i18next'
import { Columns3 } from 'lucide-react'
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

interface ColumnVisibilityMenuProps {
  environments: string[]
  hiddenEnvs: string[]
  onToggle: (env: string, hidden: boolean) => void
}

export function ColumnVisibilityMenu({
  environments,
  hiddenEnvs,
  onToggle,
}: ColumnVisibilityMenuProps) {
  const { t } = useTranslation('flags')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' rounded-full gap-2'}
      >
        <Columns3 className="size-4" aria-hidden />
        {t('columns.button')}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('columns.label')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {environments.map((env) => (
            <DropdownMenuCheckboxItem
              key={env}
              checked={!hiddenEnvs.includes(env)}
              onCheckedChange={(checked) => onToggle(env, !checked)}
            >
              <span className="font-mono text-sm">{env}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
