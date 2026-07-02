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
