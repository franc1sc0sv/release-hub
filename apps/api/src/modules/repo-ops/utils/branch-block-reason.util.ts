import { BranchBlockReason } from '../interfaces/repo-ops.interfaces'

export const PROTECTED_BRANCH_NAMES: ReadonlySet<string> = new Set(['main', 'master', 'dev', 'develop'])
export const RECENT_ACTIVITY_WINDOW_DAYS = 30

export interface IDeriveBranchBlockReasonsInput {
  branchName: string
  isDefault: boolean
  githubProtected: boolean
  hasOpenPr: boolean
  lastCommitAt: Date | null
  manuallyBlocked: boolean
}

export function isWithinRecentActivityWindow(lastCommitAt: Date): boolean {
  return Date.now() - lastCommitAt.getTime() <= RECENT_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

export function deriveBranchBlockReasons(input: IDeriveBranchBlockReasonsInput): BranchBlockReason[] {
  const reasons: BranchBlockReason[] = []

  if (input.hasOpenPr) reasons.push(BranchBlockReason.OPEN_PULL_REQUEST)
  if (input.lastCommitAt !== null && isWithinRecentActivityWindow(input.lastCommitAt)) {
    reasons.push(BranchBlockReason.RECENT_ACTIVITY)
  }
  if (PROTECTED_BRANCH_NAMES.has(input.branchName)) reasons.push(BranchBlockReason.PROTECTED_NAME)
  if (input.isDefault) reasons.push(BranchBlockReason.DEFAULT_BRANCH)
  if (input.githubProtected) reasons.push(BranchBlockReason.GITHUB_PROTECTED)
  if (input.manuallyBlocked) reasons.push(BranchBlockReason.MANUALLY_BLOCKED)

  return reasons
}

export function isBranchDeletable(blockReasons: BranchBlockReason[]): boolean {
  return blockReasons.length === 0
}

const OVERRIDABLE_BLOCK_REASONS: ReadonlySet<BranchBlockReason> = new Set([
  BranchBlockReason.RECENT_ACTIVITY,
  BranchBlockReason.PROTECTED_NAME,
])

export function isBranchOverridable(blockReasons: BranchBlockReason[]): boolean {
  if (blockReasons.length === 0) return false
  return blockReasons.every((reason) => OVERRIDABLE_BLOCK_REASONS.has(reason))
}
