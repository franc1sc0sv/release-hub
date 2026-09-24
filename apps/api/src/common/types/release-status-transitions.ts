import { ReleaseStatus } from './release-status.enum'

export const MANUAL_RELEASE_STATUS_TRANSITIONS: Record<ReleaseStatus, ReleaseStatus[]> = {
  [ReleaseStatus.DRAFT]: [ReleaseStatus.CANCELED],
  [ReleaseStatus.READY_TO_RELEASE]: [
    ReleaseStatus.DRAFT,
    ReleaseStatus.MERGED,
    ReleaseStatus.DEPLOYED,
    ReleaseStatus.CANCELED,
  ],
  [ReleaseStatus.MERGED]: [ReleaseStatus.DEPLOYED, ReleaseStatus.CANCELED],
  [ReleaseStatus.DEPLOYED]: [],
  [ReleaseStatus.CANCELED]: [ReleaseStatus.DRAFT],
}

export function canTransitionReleaseStatus(from: ReleaseStatus, to: ReleaseStatus): boolean {
  return MANUAL_RELEASE_STATUS_TRANSITIONS[from].includes(to)
}
