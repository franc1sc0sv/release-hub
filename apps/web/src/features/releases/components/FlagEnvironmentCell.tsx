import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FlagEnvironmentCellProps {
  flagKey: string
  environmentName: string
  enabled: boolean
  staged: boolean
  failure: string | null
  editable: boolean
  onToggle: () => void
}

function StateDot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'size-2.5 shrink-0 rounded-full',
        on ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'border-[1.5px] border-slate-500',
      )}
    />
  )
}

export function FlagEnvironmentCell({
  flagKey,
  environmentName,
  enabled,
  staged,
  failure,
  editable,
  onToggle,
}: FlagEnvironmentCellProps) {
  const { t } = useTranslation(['releases', 'flags'])
  const next = staged ? !enabled : enabled
  const label = staged
    ? t(enabled ? 'workspace.flags.cell.stagedOff' : 'workspace.flags.cell.stagedOn')
    : t(enabled ? 'flags:state.on' : 'flags:state.off')

  if (!editable) {
    return (
      <span className={cn('flex h-9 items-center justify-center gap-1.5 text-xs', enabled ? 'text-emerald-300' : 'text-muted-foreground')}>
        <StateDot on={enabled} />
        {label}
      </span>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      aria-pressed={staged}
      aria-label={t('workspace.flags.cell.toggleLabel', { flag: flagKey, environment: environmentName })}
      title={failure ?? undefined}
      className={cn(
        'h-9 w-full gap-1.5 border-white/8 bg-white/[0.02] text-xs font-medium',
        enabled && !staged && 'text-emerald-300',
        !enabled && !staged && 'text-muted-foreground',
        staged && 'border-dashed border-brand-indigo-bright bg-brand-indigo-bright/15 text-foreground',
        failure && 'border-destructive text-destructive',
      )}
    >
      {failure ? <AlertCircle className="size-3.5" aria-hidden /> : <StateDot on={next} />}
      {label}
    </Button>
  )
}
