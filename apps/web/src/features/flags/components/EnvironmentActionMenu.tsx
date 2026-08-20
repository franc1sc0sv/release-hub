import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'

interface EnvironmentActionMenuProps {
  label: string
  environments: string[]
  onApply: (environments: string[]) => void
}

export function EnvironmentActionMenu({ label, environments, onApply }: EnvironmentActionMenuProps) {
  const { t } = useTranslation('flags')
  const [checked, setChecked] = useState<string[]>([])

  function toggle(environment: string) {
    setChecked((current) =>
      current.includes(environment)
        ? current.filter((entry) => entry !== environment)
        : [...current, environment],
    )
  }

  function apply() {
    onApply(checked)
    setChecked([])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' gap-2'}>
        {label}
        <ChevronDown className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('write.actions.environmentsLabel')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {environments.map((environment) => (
          <DropdownMenuCheckboxItem
            key={environment}
            checked={checked.includes(environment)}
            onCheckedChange={() => toggle(environment)}
            onSelect={(event) => event.preventDefault()}
          >
            <span className="font-mono text-sm">{environment}</span>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={checked.length === 0} onSelect={apply}>
          {t('write.actions.review', { count: checked.length })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
