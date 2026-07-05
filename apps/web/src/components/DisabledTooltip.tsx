import type { ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DisabledTooltipProps {
  tooltip: string
  children: ReactNode
}

export function DisabledTooltip({ tooltip, children }: DisabledTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>
          {children}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
