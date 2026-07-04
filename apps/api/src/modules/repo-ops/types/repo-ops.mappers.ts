import type { IBlockedBranch } from '../interfaces/blocked-branch.repository'
import type {
  IBranchCleanupCandidate,
  IBranchCleanupPage,
  IBranchCleanupPageItem,
  IBranchCleanupPlan,
  IDeleteBranchOutcome,
} from '../interfaces/repo-ops.interfaces'
import { BlockedBranchType } from './blocked-branch.type'
import { BranchCleanupCandidateType, BranchCleanupSignalsType } from './branch-cleanup-candidate.type'
import { BranchCleanupPageItemType, BranchCleanupPageSignalsType } from './branch-cleanup-page-item.type'
import { BranchCleanupPageType } from './branch-cleanup-page.type'
import {
  BranchCleanupPlanDeletableType,
  BranchCleanupPlanKeptType,
  BranchCleanupPlanType,
} from './branch-cleanup-plan.type'
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

export function toBranchCleanupPageItemType(item: IBranchCleanupPageItem): BranchCleanupPageItemType {
  const signals = new BranchCleanupPageSignalsType()
  signals.mergedViaPr = item.signals.mergedViaPr
  signals.noOpenPr = item.signals.noOpenPr
  signals.unreferencedByReleases = item.signals.unreferencedByReleases

  const out = new BranchCleanupPageItemType()
  out.name = item.name
  out.isDefault = item.isDefault
  out.githubProtected = item.githubProtected
  out.lastCommitAt = item.lastCommitAt
  out.lastCommitAuthorLogin = item.lastCommitAuthorLogin
  out.lastCommitAuthorName = item.lastCommitAuthorName
  out.lastCommitAuthorAvatarUrl = item.lastCommitAuthorAvatarUrl
  out.openPullRequestNumber = item.openPullRequestNumber
  out.openPullRequestUrl = item.openPullRequestUrl
  out.signals = signals
  out.blockReasons = item.blockReasons
  out.deletable = item.deletable
  out.overridable = item.overridable
  return out
}

export function toBranchCleanupPageType(page: IBranchCleanupPage): BranchCleanupPageType {
  const out = new BranchCleanupPageType()
  out.items = page.items.map(toBranchCleanupPageItemType)
  out.totalCount = page.totalCount
  return out
}

export function toBranchCleanupPlanType(plan: IBranchCleanupPlan): BranchCleanupPlanType {
  const out = new BranchCleanupPlanType()
  out.deletable = plan.deletable.map((item) => {
    const deletable = new BranchCleanupPlanDeletableType()
    deletable.name = item.name
    deletable.lastCommitAt = item.lastCommitAt
    deletable.lastCommitAuthorLogin = item.lastCommitAuthorLogin
    deletable.lastCommitAuthorName = item.lastCommitAuthorName
    deletable.lastCommitAuthorAvatarUrl = item.lastCommitAuthorAvatarUrl
    return deletable
  })
  out.kept = plan.kept.map((item) => {
    const kept = new BranchCleanupPlanKeptType()
    kept.name = item.name
    kept.blockReasons = item.blockReasons
    return kept
  })
  out.totalCount = plan.deletable.length + plan.kept.length
  return out
}
