import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import { ChevronsUpDown, Loader2 } from 'lucide-react'
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
import { LIST_FEATURES_PAGE } from '@/features/features/graphql/features.queries'

const SEARCH_DEBOUNCE_MS = 250
const SEARCH_LIMIT = 50

interface FeatureComboboxProps {
  projectId: string
  value: string | null
  label: string
  onChange: (featureId: string) => void
  disabled?: boolean
  id?: string
}

export function FeatureCombobox({
  projectId,
  value,
  label,
  onChange,
  disabled,
  id,
}: FeatureComboboxProps) {
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

  const { data, loading } = useQuery(LIST_FEATURES_PAGE, {
    variables: {
      input: {
        projectId,
        limit: SEARCH_LIMIT,
        offset: 0,
        search: debouncedSearch || undefined,
        assignableOnly: true,
      },
    },
    skip: !open,
    fetchPolicy: 'cache-and-network',
  })

  const items = data?.listFeaturesPage.items ?? []
  const hasMore = data?.listFeaturesPage.hasMore ?? false

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
            className="h-7 min-w-0 flex-1 justify-between text-xs font-normal"
          />
        }
      >
        <span className={cn('truncate', !value && 'text-muted-foreground')}>
          {value ? label : t('draft.selectFeature')}
        </span>
        <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-[--trigger-width] min-w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={t('draft.searchFeature')}
          />
          <CommandList>
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('draft.loadingFeatures')}
              </div>
            ) : (
              <>
                <CommandEmpty>{t('draft.noFeatureMatches')}</CommandEmpty>
                <CommandGroup>
                  {items.map((feature) => (
                    <CommandItem
                      key={feature.id}
                      value={feature.id}
                      onSelect={(selected) => {
                        onChange(selected)
                        setOpen(false)
                      }}
                      data-checked={feature.id === value}
                      className="text-xs"
                    >
                      <span className="truncate">{feature.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {hasMore && (
                  <p className="border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
                    {t('draft.refineFeatureHint')}
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
