import { ReleaseFlagDecisionType } from '@release-hub/db'
import { FlagDeploymentStatus } from './flag-deployment-status.enum'

export function computeFlagDeploymentStatus(
  decision: ReleaseFlagDecisionType | null,
  hasConflict: boolean,
): FlagDeploymentStatus {
  if (decision === ReleaseFlagDecisionType.SHIP_OFF) return FlagDeploymentStatus.SHIPPED_OFF
  if (decision === ReleaseFlagDecisionType.in_progress) return FlagDeploymentStatus.IN_PROGRESS
  if (decision === ReleaseFlagDecisionType.ENABLE_IN_RELEASE) {
    return hasConflict ? FlagDeploymentStatus.CONFLICT : FlagDeploymentStatus.SHIPPED_ON
  }
  return FlagDeploymentStatus.UNTRACKED
}
