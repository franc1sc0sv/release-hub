import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EnvironmentActionMenuProps {
  label: string
  environments: string[]
  onApply: (environments: string[]) => void
  triggerClassName?: string
}

export function EnvironmentActionMenu({
  label,
  environments,
  onApply,
  triggerClassName,
}: EnvironmentActionMenuProps) {
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
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2', triggerClassName)}
      >
        {label}
        <ChevronDown className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('write.actions.environmentsLabel')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {environments.map((environment) => (
            <DropdownMenuCheckboxItem
              key={environment}
              checked={checked.includes(environment)}
              onCheckedChange={() => toggle(environment)}
            >
              <span className="font-mono text-sm">{environment}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={checked.length === 0} onClick={apply}>
          {t('write.actions.review', { count: checked.length })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
