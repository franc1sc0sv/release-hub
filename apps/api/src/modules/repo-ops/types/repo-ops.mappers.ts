import type { IBlockedBranch } from '../interfaces/blocked-branch.repository'
import type {
  IBranchCleanupCandidate,
  IDeleteBranchOutcome,
} from '../interfaces/repo-ops.interfaces'
import { BlockedBranchType } from './blocked-branch.type'
import { BranchCleanupCandidateType, BranchCleanupSignalsType } from './branch-cleanup-candidate.type'
import { DeleteBranchOutcomeType } from './delete-branch-outcome.type'

export function toBlockedBranchType(blockedBranch: IBlockedBranch): BlockedBranchType {
  const out = new BlockedBranchType()
  out.id = blockedBranch.id
  out.projectId = blockedBranch.projectId
  out.branchName = blockedBranch.branchName
  out.reason = blockedBranch.reason
  out.createdById = blockedBranch.createdById
  out.createdAt = blockedBranch.createdAt
  return out
}

export function toBranchCleanupCandidateType(
  candidate: IBranchCleanupCandidate,
): BranchCleanupCandidateType {
  const signals = new BranchCleanupSignalsType()
  signals.mergedViaPr = candidate.signals.mergedViaPr
  signals.stale = candidate.signals.stale
  signals.unreferencedByReleases = candidate.signals.unreferencedByReleases
  signals.noOpenPr = candidate.signals.noOpenPr
  signals.blocked = candidate.signals.blocked
  signals.isDefault = candidate.signals.isDefault

  const out = new BranchCleanupCandidateType()
  out.name = candidate.name
  out.lastCommitDate = candidate.lastCommitDate
  out.protected = candidate.protected
  out.signals = signals
  out.suggested = candidate.suggested
  return out
}

export function toDeleteBranchOutcomeType(outcome: IDeleteBranchOutcome): DeleteBranchOutcomeType {
  const out = new DeleteBranchOutcomeType()
  out.branchName = outcome.branchName
  out.deleted = outcome.deleted
  out.reason = outcome.reason
  return out
}
