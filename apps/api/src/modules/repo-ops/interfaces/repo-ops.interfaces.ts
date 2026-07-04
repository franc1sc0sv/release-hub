export interface IBranchCleanupSignals {
  mergedViaPr: boolean
  stale: boolean
  unreferencedByReleases: boolean
  noOpenPr: boolean
  blocked: boolean
  isDefault: boolean
}

export interface IBranchCleanupCandidate {
  name: string
  lastCommitDate: Date | null
  protected: boolean
  signals: IBranchCleanupSignals
  suggested: boolean
}

export interface IDeleteBranchOutcome {
  branchName: string
  deleted: boolean
  reason: string | null
}

export const BranchBlockReason = {
  OPEN_PULL_REQUEST: 'open_pull_request',
  RECENT_ACTIVITY: 'recent_activity',
  PROTECTED_NAME: 'protected_name',
  DEFAULT_BRANCH: 'default_branch',
  GITHUB_PROTECTED: 'github_protected',
  MANUALLY_BLOCKED: 'manually_blocked',
  RELEASE_REFERENCED: 'release_referenced',
} as const

export type BranchBlockReason = (typeof BranchBlockReason)[keyof typeof BranchBlockReason]

export const BranchCleanupSortField = {
  LAST_ACTIVITY: 'last_activity',
  AUTHOR: 'author',
  PROTECTED: 'protected',
  MERGED_VIA_PR: 'merged_via_pr',
  OPEN_PR: 'open_pr',
  UNREFERENCED: 'unreferenced',
} as const

export type BranchCleanupSortField = (typeof BranchCleanupSortField)[keyof typeof BranchCleanupSortField]

export const BranchActivityRange = {
  LAST_WEEK: 'last_week',
  LAST_MONTH: 'last_month',
  LAST_3_MONTHS: 'last_3_months',
  LAST_6_MONTHS: 'last_6_months',
  OVER_6_MONTHS: 'over_6_months',
} as const

export type BranchActivityRange = (typeof BranchActivityRange)[keyof typeof BranchActivityRange]

export const BranchProtectionFilter = {
  PROTECTED: 'protected',
  UNPROTECTED: 'unprotected',
} as const

export type BranchProtectionFilter = (typeof BranchProtectionFilter)[keyof typeof BranchProtectionFilter]

export const BranchSignalFilter = {
  MERGED_VIA_PR: 'merged_via_pr',
  OPEN_PR: 'open_pr',
  UNREFERENCED: 'unreferenced',
} as const

export type BranchSignalFilter = (typeof BranchSignalFilter)[keyof typeof BranchSignalFilter]

export interface IBranchCleanupPageSignals {
  mergedViaPr: boolean
  noOpenPr: boolean
  unreferencedByReleases: boolean
}

export interface IBranchCleanupPageItem {
  name: string
  isDefault: boolean
  githubProtected: boolean
  lastCommitAt: Date | null
  lastCommitAuthorLogin: string | null
  lastCommitAuthorName: string | null
  lastCommitAuthorAvatarUrl: string | null
  openPullRequestNumber: number | null
  openPullRequestUrl: string | null
  signals: IBranchCleanupPageSignals
  blockReasons: BranchBlockReason[]
  deletable: boolean
  overridable: boolean
}

export interface IBranchCleanupPage {
  items: IBranchCleanupPageItem[]
  totalCount: number
}

export interface IBranchCleanupPlanDeletable {
  name: string
  lastCommitAt: Date | null
  lastCommitAuthorLogin: string | null
  lastCommitAuthorName: string | null
  lastCommitAuthorAvatarUrl: string | null
}

export interface IBranchCleanupPlanKept {
  name: string
  blockReasons: BranchBlockReason[]
}

export interface IBranchCleanupPlan {
  deletable: IBranchCleanupPlanDeletable[]
  kept: IBranchCleanupPlanKept[]
}
