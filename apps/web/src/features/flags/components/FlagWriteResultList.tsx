import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { FlagWriteReport } from '../hooks/use-flag-write-actions'

interface FlagWriteResultListProps {
  report: FlagWriteReport
}

export function FlagWriteResultList({ report }: FlagWriteResultListProps) {
  const { t } = useTranslation('flags')
  const failures = report.results.filter((result) => !result.ok)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <span className="inline-flex items-center gap-2 text-sm text-status-live-fg">
          <CheckCircle2 className="size-4" aria-hidden />
          {t('write.result.succeeded', { count: report.succeeded })}
        </span>
        {report.failed > 0 && (
          <span className="inline-flex items-center gap-2 text-sm text-destructive">
            <XCircle className="size-4" aria-hidden />
            {t('write.result.failed', { count: report.failed })}
          </span>
        )}
      </div>

      {failures.length > 0 && (
        <ul className="space-y-2">
          {failures.map((failure) => (
            <li
              key={`${failure.flagKey}:${failure.environmentName ?? ''}`}
              className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2"
            >
              <p className="font-mono text-xs text-foreground">
                {failure.flagKey}
                {failure.environmentName ? ` · ${failure.environmentName}` : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                {failure.error ?? t('write.result.unknownError')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
