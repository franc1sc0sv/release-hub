import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/nebula/EmptyState'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useCompareFlags } from '../hooks/use-compare-flags'
import { EnvStateCell } from './EnvStateCell'
import type { FlagComparisonRowType } from '@/generated/graphql'

interface CompareFlagsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  visibleEnvironments: string[]
}

interface DivergenceChipProps {
  name: string
  enabled: boolean
}

function DivergenceChip({ name, enabled }: DivergenceChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1">
      <span className="font-mono text-xs text-foreground">{name}</span>
      <EnvStateCell enabled={enabled} />
    </span>
  )
}

interface FlagGroupProps {
  heading: string
  count: number
  items: FlagComparisonRowType[]
  renderChips: (item: FlagComparisonRowType) => React.ReactNode
}

function FlagGroup({ heading, count, items, renderChips }: FlagGroupProps) {
  if (items.length === 0) return null
  return (
    <section aria-label={heading}>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-card/50 px-4 py-3"
          >
            <span className="shrink-0 font-mono text-sm font-medium text-foreground">
              {item.key}
            </span>
            <span className="flex flex-wrap gap-2">{renderChips(item)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CompareFlagsDialog({
  open,
  onOpenChange,
  projectId,
  visibleEnvironments,
}: CompareFlagsDialogProps) {
  const { t } = useTranslation('flags')
  const { compare, items, loading, called } = useCompareFlags()

  const [persistedBaseline, setBaselineEnvs] = useLocalStorage<string[]>(
    `release-hub:flags:baseline:${projectId}`,
    [],
  )

  const validPersisted = persistedBaseline.filter((e) => visibleEnvironments.includes(e))
  const suggested = visibleEnvironments.find((e) => /prod/i.test(e)) ?? visibleEnvironments[0]
  const baselineEnv = validPersisted[0] ?? suggested ?? null
  const comparedEnvs = visibleEnvironments.filter((e) => e !== baselineEnv)

  const canQuery = open && baselineEnv !== null && comparedEnvs.length >= 1

  useEffect(() => {
    if (canQuery && baselineEnv) {
      compare(projectId, [baselineEnv], comparedEnvs)
    }
  }, [open, baselineEnv, comparedEnvs.join(',')])

  const onInProdItems = items.filter((i) => i.baselineEnabled === true)
  const offInProdItems = items.filter((i) => i.baselineEnabled === false)

  function runCompare() {
    if (baselineEnv) {
      compare(projectId, [baselineEnv], comparedEnvs)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t('compare.title')}</DialogTitle>
          {baselineEnv && (
            <p className="text-sm text-muted-foreground">
              {t('compare.comparedAgainst', { envs: baselineEnv })}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('compare.baselineLabel')}
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label={t('compare.baselineLabel')}
          >
            {visibleEnvironments.map((env) => {
              const isActive = baselineEnv === env
              return (
                <Button
                  key={env}
                  variant="outline"
                  size="sm"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setBaselineEnvs([env])}
                  className={[
                    'rounded-full font-mono text-xs transition-colors',
                    isActive
                      ? 'border-brand-indigo-bright bg-brand-indigo-bright/10 text-brand-indigo-bright hover:bg-brand-indigo-bright/20'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {env}
                </Button>
              )
            })}
          </div>
        </div>

        {!baselineEnv && (
          <p className="text-sm text-muted-foreground">{t('compare.selectBaseline')}</p>
        )}

        {baselineEnv && comparedEnvs.length === 0 && (
          <p className="text-sm text-muted-foreground">{t('compare.selectCompared')}</p>
        )}

        {canQuery && (loading || !called) && (
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="size-6 animate-spin text-brand-indigo-bright" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('compare.loading')}</p>
          </div>
        )}

        {canQuery && called && !loading && (
          <>
            <div className="flex items-center justify-between gap-3">
              {items.length > 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('compare.count', { count: items.length })}
                </p>
              ) : (
                <span />
              )}
              <Button variant="ghost" size="sm" className="gap-2" onClick={runCompare}>
                <RefreshCw className="size-4" aria-hidden />
                {t('compare.reRun')}
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {items.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="size-7 text-brand-indigo-bright" aria-hidden />}
                  heading={t('compare.inSync')}
                  description=""
                />
              ) : (
                <div className="space-y-6">
                  <FlagGroup
                    heading={t('compare.group.onInProd')}
                    count={onInProdItems.length}
                    items={onInProdItems}
                    renderChips={(item) =>
                      item.divergences.map((d) => (
                        <DivergenceChip key={d.name} name={d.name} enabled={false} />
                      ))
                    }
                  />
                  <FlagGroup
                    heading={t('compare.group.offInProd')}
                    count={offInProdItems.length}
                    items={offInProdItems}
                    renderChips={(item) =>
                      item.divergences.map((d) => (
                        <DivergenceChip key={d.name} name={d.name} enabled={true} />
                      ))
                    }
                  />
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
