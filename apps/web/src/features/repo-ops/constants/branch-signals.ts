import { GitMerge, Unlink } from 'lucide-react'
import type { StatusBadgeToneValue } from '@/components/nebula/StatusBadge'
import { StatusBadgeTone } from '@/components/nebula/StatusBadge'
import type { BranchCleanupPageSignalsType } from '@/generated/graphql'

export const BranchSignalKey = {
  MERGED_VIA_PR: 'mergedViaPr',
  UNREFERENCED_BY_RELEASES: 'unreferencedByReleases',
} as const satisfies Record<string, keyof BranchCleanupPageSignalsType>

export type BranchSignalKeyValue = (typeof BranchSignalKey)[keyof typeof BranchSignalKey]

export const BRANCH_SIGNAL_ICON: Record<BranchSignalKeyValue, typeof GitMerge> = {
  mergedViaPr: GitMerge,
  unreferencedByReleases: Unlink,
}

export const BRANCH_SIGNAL_TONE: Record<BranchSignalKeyValue, StatusBadgeToneValue> = {
  mergedViaPr: StatusBadgeTone.EMERALD,
  unreferencedByReleases: StatusBadgeTone.SLATE,
}

export const VISIBLE_SIGNAL_KEYS: BranchSignalKeyValue[] = [
  BranchSignalKey.MERGED_VIA_PR,
  BranchSignalKey.UNREFERENCED_BY_RELEASES,
]
