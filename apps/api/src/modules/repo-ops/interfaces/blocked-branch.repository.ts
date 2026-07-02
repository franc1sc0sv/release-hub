import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'

export interface IBlockedBranch {
  id: string
  projectId: string
  branchName: string
  reason: string | null
  createdById: string
  createdAt: Date
}

export interface ICreateBlockedBranchData {
  projectId: string
  branchName: string
  reason: string | null
  createdById: string
}

export abstract class IBlockedBranchRepository implements IBaseRepository<IBlockedBranch> {
  abstract findById: RepositoryMethod<[id: string], IBlockedBranch | null>
  abstract findAllByProject: RepositoryMethod<[projectId: string], IBlockedBranch[]>
  abstract findByProjectAndBranch: RepositoryMethod<
    [projectId: string, branchName: string],
    IBlockedBranch | null
  >
  abstract create: RepositoryMethod<[data: ICreateBlockedBranchData], IBlockedBranch>
  abstract deleteByProjectAndBranch: RepositoryMethod<[projectId: string, branchName: string], void>
}
