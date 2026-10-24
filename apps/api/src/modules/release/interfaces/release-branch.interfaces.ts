import type { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'

export const BranchUpdateAction = {
  NOTHING: 'nothing',
  FAST_FORWARD: 'fast_forward',
  REFUSE: 'refuse',
  MERGE: 'merge',
} as const

export type BranchUpdateAction = (typeof BranchUpdateAction)[keyof typeof BranchUpdateAction]

export interface IParentBranchComparison {
  ref: string
  aheadBy: number
  behindBy: number
}

export interface IParentCandidatesInput {
  defaultParentBranch: string | null
  repoDefaultBranch: string
  baseRef: string
  compareRef: string
}

export interface IReleaseBranchWriteCheck {
  compareRef: string
  baseRef: string
  repoDefaultBranch: string
  defaultParentBranch: string | null
  isProtected: boolean
}

export interface IBranchUpdateDecisionInput {
  method: BranchUpdateMethod
  behindBy: number
  ownCommits: number
}

export interface IReleaseParentSource {
  repo: string
  accessToken: string
  baseRef: string
  compareRef: string
  storedSourceRef: string | null
  defaultParentBranch: string | null
}

export interface IResolvedReleaseParent {
  sourceRef: string | null
  detected: boolean
  behindBy: number
  ownCommits: number
}

export interface IReleaseBranchSource extends IReleaseParentSource {
  projectId: string
  updateMethod: BranchUpdateMethod
}

export interface IUpdateReleaseBranchPreparation {
  projectId: string
  method: BranchUpdateMethod
  sourceRef: string
  detected: boolean
  commitsAdded: number
  headSha: string
}

export interface ISetReleaseSourceRefPreparation {
  sourceRef: string
}
