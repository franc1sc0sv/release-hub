import { AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/nebula/StatusBadge'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import { FlagDeploymentStatusValue, flagDeploymentStatusTone } from '../constants/flag-enums'
import type { FlagDeploymentStatus } from '@/generated/graphql'

interface FlagDeploymentStatusBadgeProps {
  status: FlagDeploymentStatus
}

export function FlagDeploymentStatusBadge({ status }: FlagDeploymentStatusBadgeProps) {
  const enumLabels = useEnumLabels()
  const isConflict = status === FlagDeploymentStatusValue.CONFLICT

  return (
    <StatusBadge tone={flagDeploymentStatusTone(status)} icon={isConflict ? AlertTriangle : undefined}>
      {enumLabels.flagDeploymentStatus(status)}
    </StatusBadge>
  )
}
