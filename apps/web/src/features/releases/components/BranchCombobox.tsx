import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { GithubBranchType } from '@/generated/graphql'

interface BranchComboboxProps {
  branches: GithubBranchType[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function BranchCombobox({
  branches,
  value,
  onChange,
  placeholder,
  disabled,
  id,
}: BranchComboboxProps) {
  const { t } = useTranslation('releases')
  const [open, setOpen] = useState(false)

  const selected = branches.find((b) => b.name === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <GitBranch className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.name : (placeholder ?? t('wizard.branches.searchPlaceholder'))}
          </span>
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-[--trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={t('wizard.branches.searchPlaceholder')} />
          <CommandList>
            <CommandEmpty>{t('wizard.branches.noResults')}</CommandEmpty>
            <CommandGroup>
              {branches.map((branch) => (
                <CommandItem
                  key={branch.name}
                  value={branch.name}
                  onSelect={(v) => {
                    onChange(v)
                    setOpen(false)
                  }}
                  data-checked={branch.name === value}
                >
                  <GitBranch className="size-3.5 text-muted-foreground" aria-hidden />
                  <span className="truncate">{branch.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
