import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, FileText, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GradientButton } from '@/components/nebula/GradientButton'
import { useCompareFlags } from '../hooks/use-compare-flags'
import { exportFlagComparisonPdf, flagComparisonPdfFilename } from '../lib/flag-export'

interface ExportFlagsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  environments: string[]
}

export function ExportFlagsDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  environments,
}: ExportFlagsDialogProps) {
  const { t } = useTranslation('flags')
  const { compare, items, loading, called } = useCompareFlags()

  const [selectedEnvs, setSelectedEnvs] = useState<string[]>([])
  const [mainEnv, setMainEnv] = useState('')
  const [exporting, setExporting] = useState(false)

  const environmentsKey = environments.join(',')

  useEffect(() => {
    if (!open || environments.length === 0) return
    setSelectedEnvs((prev) => {
      const valid = prev.filter((env) => environments.includes(env))
      return valid.length > 0 ? valid : environments
    })
    setMainEnv((prev) =>
      prev && environments.includes(prev)
        ? prev
        : (environments.find((env) => /prod/i.test(env)) ?? environments[0]),
    )
  }, [open, environmentsKey])

  useEffect(() => {
    if (selectedEnvs.length > 0 && !selectedEnvs.includes(mainEnv)) {
      setMainEnv(selectedEnvs.find((env) => /prod/i.test(env)) ?? selectedEnvs[0])
    }
  }, [selectedEnvs, mainEnv])

  const comparedEnvs = selectedEnvs.filter((env) => env !== mainEnv)
  const canCompare = open && mainEnv !== '' && comparedEnvs.length >= 1
  const comparedKey = comparedEnvs.join(',')

  useEffect(() => {
    if (canCompare) {
      compare(projectId, [mainEnv], comparedEnvs)
    }
  }, [open, mainEnv, comparedKey])

  function toggleEnv(env: string) {
    setSelectedEnvs((prev) =>
      prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env],
    )
  }

  async function handleExport() {
    if (!canCompare || exporting) return
    setExporting(true)
    try {
      await exportFlagComparisonPdf(
        {
          projectName,
          baselineEnvironment: mainEnv,
          comparedEnvironments: comparedEnvs,
          rows: items,
          generatedAtIso: new Date().toISOString(),
          labels: {
            brand: t('export.brand'),
            reportTitle: t('export.comparison.reportTitle'),
            baselineLabel: t('export.comparison.baselineLabel'),
            comparedLabel: t('export.comparison.comparedLabel'),
            generatedLabel: t('export.generatedLabel'),
            totalLabel: t('export.comparison.totalLabel'),
            onInBaselineLabel: t('export.comparison.onInBaselineLabel'),
            offInBaselineLabel: t('export.comparison.offInBaselineLabel'),
            onInBaselineHeading: t('export.comparison.onHeading', { env: mainEnv }),
            offInBaselineHeading: t('export.comparison.offHeading', { env: mainEnv }),
            inSync: t('export.comparison.inSync', { env: mainEnv }),
            footer: t('export.footer'),
          },
        },
        flagComparisonPdfFilename(projectName, mainEnv),
      )
      onOpenChange(false)
    } finally {
      setExporting(false)
    }
  }

  const canExport = canCompare && called && !loading && !exporting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>{t('export.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('export.includeLabel')}
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('export.includeLabel')}>
              {environments.map((env) => {
                const isSelected = selectedEnvs.includes(env)
                return (
                  <Button
                    key={env}
                    variant="outline"
                    size="sm"
                    aria-pressed={isSelected}
                    onClick={() => toggleEnv(env)}
                    className={[
                      'gap-1.5 rounded-full font-mono text-xs transition-colors',
                      isSelected
                        ? 'border-brand-indigo-bright bg-brand-indigo-bright/10 text-brand-indigo-bright hover:bg-brand-indigo-bright/20'
                        : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {isSelected && <Check className="size-3.5" aria-hidden />}
                    {env}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('export.mainLabel')}
            </p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('export.mainLabel')}>
              {selectedEnvs.map((env) => {
                const isMain = mainEnv === env
                return (
                  <Button
                    key={env}
                    variant="outline"
                    size="sm"
                    role="radio"
                    aria-checked={isMain}
                    onClick={() => setMainEnv(env)}
                    className={[
                      'rounded-full font-mono text-xs transition-colors',
                      isMain
                        ? 'border-brand-magenta bg-brand-magenta/10 text-brand-magenta hover:bg-brand-magenta/20'
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

          {comparedEnvs.length < 1 ? (
            <p className="text-sm text-muted-foreground">{t('export.needTwo')}</p>
          ) : loading || !called ? (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="size-5 animate-spin text-brand-indigo-bright" aria-hidden />
              <p className="text-sm text-muted-foreground">{t('export.loading')}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {items.length > 0
                ? t('compare.count', { count: items.length })
                : t('export.comparison.inSync', { env: mainEnv })}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('export.cancel')}
          </Button>
          <GradientButton
            onClick={handleExport}
            disabled={!canExport}
            className="gap-2 rounded-full border-0 bg-nebula-gradient text-white shadow-glow-indigo"
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <FileText className="size-4" aria-hidden />
            )}
            {t('export.download')}
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
