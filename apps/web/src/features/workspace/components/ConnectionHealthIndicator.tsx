import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Github, CheckCircle2, MinusCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { IntegrationStatus } from '@/generated/graphql'

const CONNECTED: IntegrationStatus = 'CONNECTED'

interface IntegrationIconProps {
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

type IntegrationIconComponent = (props: IntegrationIconProps) => ReactNode

interface IntegrationRowProps {
  icon: IntegrationIconComponent
  label: string
  status: IntegrationStatus
  tooltipConnected: string
  tooltipNotConfigured: string
}

function IntegrationRow({
  icon: Icon,
  label,
  status,
  tooltipConnected,
  tooltipNotConfigured,
}: IntegrationRowProps) {
  const isConnected = status === CONNECTED

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors cursor-default"
            role="status"
            aria-label={`${label}: ${isConnected ? tooltipConnected : tooltipNotConfigured}`}
          />
        }
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium text-foreground flex-1">{label}</span>
        {isConnected ? (
          <Badge
            className="flex items-center gap-1 rounded-full border-0 bg-[var(--status-live-bg)] text-[var(--status-live-fg)] px-2"
            aria-hidden="true"
          >
            <CheckCircle2 className="size-3" aria-hidden />
            <span className="text-xs font-medium">{tooltipConnected}</span>
          </Badge>
        ) : (
          <Badge
            className="flex items-center gap-1 rounded-full border-0 bg-[var(--status-draft-bg)] text-[var(--status-draft-fg)] px-2"
            aria-hidden="true"
          >
            <MinusCircle className="size-3" aria-hidden />
            <span className="text-xs font-medium">{tooltipNotConfigured}</span>
          </Badge>
        )}
      </TooltipTrigger>
      <TooltipContent side="right">
        {isConnected ? tooltipConnected : tooltipNotConfigured}
      </TooltipContent>
    </Tooltip>
  )
}

function LinearIcon({ className, ...rest }: IntegrationIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      {...rest}
    >
      <path d="M1.22541 61.5228c-.1484-.6015.3144-1.1892.9314-1.1892h44.1204c.5367 0 .9465.4537.9092.9895L46.6 89.7c-.0493.7023-.8652 1.0425-1.3991.5857L1.7795 51.8638a.9316.9316 0 0 1-.5541-.9315V61.5228zM0 48.5c0-.5128.2083-1.0045.5799-1.366L48.134.5799A1.9915 1.9915 0 0 1 49.5 0C50.3284 0 51 .6716 51 1.5v44.1204c0 .5367-.4537.9465-.9895.9092L1.7 46.0997C.9977 46.0504.657 45.2344 1.1137 44.7003L0 44.7003V48.5zm53 5.5v44.5c0 .8284.6716 1.5 1.5 1.5.3931 0 .7706-.1543 1.0491-.4291L99.4209 55.5709A1.4998 1.4998 0 0 0 99.85 54.5v-.0015C99.85 53.671 99.179 53 98.35 53H54.5c-.8284 0-1.5.6716-1.5 1.5z" />
    </svg>
  )
}

function FlagsmithIcon({ className, ...rest }: IntegrationIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
      <path d="M4 3h16v2H4zM4 7h12v2H4zM4 11h10v2H4zM4 15h8v2H4zM4 19h6v2H4z" />
    </svg>
  )
}

interface ConnectionHealthIndicatorProps {
  github: IntegrationStatus
  linear: IntegrationStatus
  flagsmith: IntegrationStatus
}

export function ConnectionHealthIndicator({ github, linear, flagsmith }: ConnectionHealthIndicatorProps) {
  const { t } = useTranslation('workspace')

  return (
    <div
      className="flex flex-col gap-1"
      aria-label={t('connectionHealth.title')}
    >
      <IntegrationRow
        icon={Github}
        label={t('connectionHealth.github')}
        status={github}
        tooltipConnected={t('connectionHealth.connected')}
        tooltipNotConfigured={t('connectionHealth.notConfigured')}
      />
      <IntegrationRow
        icon={LinearIcon}
        label={t('connectionHealth.linear')}
        status={linear}
        tooltipConnected={t('connectionHealth.connected')}
        tooltipNotConfigured={t('connectionHealth.notConfigured')}
      />
      <IntegrationRow
        icon={FlagsmithIcon}
        label={t('connectionHealth.flagsmith')}
        status={flagsmith}
        tooltipConnected={t('connectionHealth.connected')}
        tooltipNotConfigured={t('connectionHealth.notConfigured')}
      />
    </div>
  )
}
