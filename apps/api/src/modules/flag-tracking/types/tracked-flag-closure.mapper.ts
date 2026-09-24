import type { ITrackedFlag } from '../interfaces/flag-tracking.interfaces'
import { TrackedFlagClosureType } from './tracked-flag-closure.type'

export function toTrackedFlagClosureType(flag: ITrackedFlag): TrackedFlagClosureType {
  const type = new TrackedFlagClosureType()
  type.id = flag.id
  type.key = flag.key
  type.closedAt = flag.closedAt
  type.closedReason = flag.closedReason
  return type
}
