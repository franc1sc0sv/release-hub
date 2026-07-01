import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronsUpDown, FileCode, Loader2 } from 'lucide-react'
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

interface RepoFileComboboxProps {
  value: string
  onChange: (value: string) => void
  results: string[]
  searching: boolean
  onSearch: (query: string) => void
  disabled?: boolean
  id?: string
}

export function RepoFileCombobox({
  value,
  onChange,
  results,
  searching,
  onSearch,
  disabled,
  id,
}: RepoFileComboboxProps) {
  const { t } = useTranslation('settings')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, open])

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
          <FileCode className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className={cn('truncate font-mono text-xs', !value && 'text-muted-foreground')}>
            {value || t('flagTracking.registry.searchPlaceholder')}
          </span>
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-[--trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t('flagTracking.registry.searchPlaceholder')}
          />
          <CommandList>
            {searching && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('flagTracking.registry.searching')}
              </div>
            )}
            {!searching && (
              <CommandEmpty>
                {query.trim()
                  ? t('flagTracking.registry.noResults')
                  : t('flagTracking.registry.typeToSearch')}
              </CommandEmpty>
            )}
            {!searching && (
              <CommandGroup>
                {results.map((path) => (
                  <CommandItem
                    key={path}
                    value={path}
                    onSelect={(v) => {
                      onChange(v)
                      setQuery(v)
                      setOpen(false)
                    }}
                    data-checked={path === value}
                  >
                    <FileCode className="size-3.5 text-muted-foreground" aria-hidden />
                    <span className="truncate font-mono text-xs">{path}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
