import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { ChevronsUpDown, GitBranch, Loader2 } from 'lucide-react'
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
import { SEARCH_GITHUB_BRANCHES } from '../graphql/releases.queries'

const SEARCH_DEBOUNCE_MS = 250
const SEARCH_LIMIT = 50

interface BranchComboboxProps {
  projectId: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function BranchCombobox({
  projectId,
  value,
  onChange,
  placeholder,
  disabled,
  id,
}: BranchComboboxProps) {
  const { t } = useTranslation('releases')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!open) {
      setSearch('')
      setDebouncedSearch('')
    }
  }, [open])

  const { data, loading } = useQuery(SEARCH_GITHUB_BRANCHES, {
    variables: { projectId, search: debouncedSearch || undefined, limit: SEARCH_LIMIT },
    skip: !projectId || !open,
    fetchPolicy: 'cache-and-network',
  })

  const items = data?.searchGithubBranches.items ?? []
  const hasMore = data?.searchGithubBranches.hasMore ?? false

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
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || (placeholder ?? t('wizard.branches.searchPlaceholder'))}
          </span>
        </span>
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-[--trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={t('wizard.branches.searchPlaceholder')}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('wizard.branches.loading')}
              </div>
            ) : (
              <>
                <CommandEmpty>{t('wizard.branches.noResults')}</CommandEmpty>
                <CommandGroup>
                  {items.map((branch) => (
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
                {hasMore && (
                  <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
                    {t('wizard.branches.refineHint')}
                  </p>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
