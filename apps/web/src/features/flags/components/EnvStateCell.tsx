interface EnvStateCellProps {
  enabled: boolean
  onLabel: string
  offLabel: string
}

export function EnvStateCell({ enabled, onLabel, offLabel }: EnvStateCellProps) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <>
          <span
            className="size-2.5 shrink-0 rounded-full bg-status-live"
            aria-hidden
          />
          <span className="text-sm text-status-live-fg">{onLabel}</span>
        </>
      ) : (
        <>
          <span
            className="size-2.5 shrink-0 rounded-full border border-muted-foreground/40"
            aria-hidden
          />
          <span className="text-sm text-muted-foreground">{offLabel}</span>
        </>
      )}
    </div>
  )
}
