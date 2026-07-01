import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, FlagIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { useReleaseFlags } from '../hooks/useReleaseFlags'
import { FlagScanButton } from './FlagScanButton'
import { ReleaseFlagRow } from './ReleaseFlagRow'
import { FlagChangeActionValue } from '../constants/release-enums'
import type { ReleaseFlagsQuery } from '@/generated/graphql'

type ReleaseFlagRowData = ReleaseFlagsQuery['releaseFlags'][number]

interface ReleaseFlagsTabProps {
  releaseId: string
}

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

function isRemovedFlag(flag: ReleaseFlagRowData): boolean {
  return flag.changes.some((change) => change.action === FlagChangeActionValue.removed)
}

function isAddedFlag(flag: ReleaseFlagRowData): boolean {
  return !isRemovedFlag(flag)
}

export function ReleaseFlagsTab({ releaseId }: ReleaseFlagsTabProps) {
  const { t } = useTranslation('releases')
  const { flags, loading, error } = useReleaseFlags(releaseId)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, 250)

  const filteredFlags = flags.filter((flag) =>
    flag.key.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const addedFlags = filteredFlags.filter(isAddedFlag)
  const removedFlags = filteredFlags.filter(isRemovedFlag)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('flags.searchPlaceholder')}
            aria-label={t('flags.searchPlaceholder')}
            className="rounded-full pl-9"
          />
        </div>
        <FlagScanButton releaseId={releaseId} />
      </div>

      {loading && flags.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="size-6 animate-spin text-brand-indigo-bright" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.loading')}</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertCircle className="size-6 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.error')}</p>
        </div>
      )}

      {!loading && !error && flags.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <FlagIcon className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">{t('flags.empty')}</p>
        </div>
      )}

      {!loading && !error && flags.length > 0 && (
        <Can I={Action.UPDATE} a={Subject.RELEASE} passThrough>
          {(canDecide) => (
            <Tabs defaultValue="added">
              <TabsList variant="line" aria-label={t('flags.subTabs.label')}>
                <TabsTrigger value="added">
                  {t('flags.subTabs.added')}
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    {addedFlags.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="removed">
                  {t('flags.subTabs.removed')}
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    {removedFlags.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="added" className="pt-2">
                {addedFlags.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <FlagIcon className="size-6 text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground">{t('flags.subTabs.addedEmpty')}</p>
                  </div>
                ) : (
                  <div>
                    {addedFlags.map((flag) => (
                      <ReleaseFlagRow
                        key={flag.id}
                        releaseId={releaseId}
                        flag={flag}
                        canDecide={canDecide}
                        showDecision
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="removed" className="pt-2">
                {removedFlags.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <FlagIcon className="size-6 text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground">{t('flags.subTabs.removedEmpty')}</p>
                  </div>
                ) : (
                  <div>
                    {removedFlags.map((flag) => (
                      <ReleaseFlagRow
                        key={flag.id}
                        releaseId={releaseId}
                        flag={flag}
                        canDecide={canDecide}
                        showDecision={false}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </Can>
      )}
    </div>
  )
}
