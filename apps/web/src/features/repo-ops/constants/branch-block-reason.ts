import type { BranchBlockReason } from '@/generated/graphql'

export const BranchBlockReasonValue = {
  DEFAULT_BRANCH: 'DEFAULT_BRANCH',
  GITHUB_PROTECTED: 'GITHUB_PROTECTED',
  OPEN_PULL_REQUEST: 'OPEN_PULL_REQUEST',
  PROTECTED_NAME: 'PROTECTED_NAME',
  RECENT_ACTIVITY: 'RECENT_ACTIVITY',
  MANUALLY_BLOCKED: 'MANUALLY_BLOCKED',
  RELEASE_REFERENCED: 'RELEASE_REFERENCED',
} as const satisfies Record<BranchBlockReason, BranchBlockReason>

export type BranchBlockReasonValueType = (typeof BranchBlockReasonValue)[keyof typeof BranchBlockReasonValue]

const OVERRIDABLE_BLOCK_REASONS: readonly BranchBlockReasonValueType[] = [
  BranchBlockReasonValue.RECENT_ACTIVITY,
  BranchBlockReasonValue.PROTECTED_NAME,
]

export function isOverridableBlockReasonSet(blockReasons: BranchBlockReason[]): boolean {
  return blockReasons.length > 0 && blockReasons.every((reason) => OVERRIDABLE_BLOCK_REASONS.includes(reason))
}

interface ISelectableBranch {
  deletable: boolean
  blockReasons: BranchBlockReason[]
}

export function isBranchRowSelectable(branch: ISelectableBranch, overridden: boolean): boolean {
  if (branch.deletable) return true
  return overridden && isOverridableBlockReasonSet(branch.blockReasons)
}
