import { GitMerge, GitPullRequestClosed, Clock, Unlink, Ban, Shield } from 'lucide-react'
import type { StatusBadgeToneValue } from '@/components/nebula/StatusBadge'
import { StatusBadgeTone } from '@/components/nebula/StatusBadge'
import type { BranchCleanupSignalsType } from '@/generated/graphql'

export const BranchSignalKey = {
  MERGED_VIA_PR: 'mergedViaPr',
  STALE: 'stale',
  UNREFERENCED_BY_RELEASES: 'unreferencedByReleases',
  NO_OPEN_PR: 'noOpenPr',
  BLOCKED: 'blocked',
  IS_DEFAULT: 'isDefault',
} as const satisfies Record<string, keyof BranchCleanupSignalsType>

export type BranchSignalKeyValue = (typeof BranchSignalKey)[keyof typeof BranchSignalKey]

export const BRANCH_SIGNAL_ICON: Record<BranchSignalKeyValue, typeof GitMerge> = {
  mergedViaPr: GitMerge,
  stale: Clock,
  unreferencedByReleases: Unlink,
  noOpenPr: GitPullRequestClosed,
  blocked: Ban,
  isDefault: Shield,
}

export const BRANCH_SIGNAL_TONE: Record<BranchSignalKeyValue, StatusBadgeToneValue> = {
  mergedViaPr: StatusBadgeTone.EMERALD,
  stale: StatusBadgeTone.AMBER,
  unreferencedByReleases: StatusBadgeTone.SLATE,
  noOpenPr: StatusBadgeTone.SLATE,
  blocked: StatusBadgeTone.ROSE,
  isDefault: StatusBadgeTone.INDIGO,
}

export const VISIBLE_SIGNAL_KEYS: BranchSignalKeyValue[] = [
  BranchSignalKey.MERGED_VIA_PR,
  BranchSignalKey.STALE,
  BranchSignalKey.UNREFERENCED_BY_RELEASES,
  BranchSignalKey.NO_OPEN_PR,
]
