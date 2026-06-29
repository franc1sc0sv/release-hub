import { useTranslation } from 'react-i18next'

interface EnvStateCellProps {
  enabled: boolean
}

export function EnvStateCell({ enabled }: EnvStateCellProps) {
  const { t } = useTranslation('flags')

  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <>
          <span
            className="size-2.5 shrink-0 rounded-full bg-status-live"
            aria-hidden
          />
          <span className="text-sm text-status-live-fg">{t('state.on')}</span>
        </>
      ) : (
        <>
          <span
            className="size-2.5 shrink-0 rounded-full border border-muted-foreground/40"
            aria-hidden
          />
          <span className="text-sm text-muted-foreground">{t('state.off')}</span>
        </>
      )}
    </div>
  )
}
