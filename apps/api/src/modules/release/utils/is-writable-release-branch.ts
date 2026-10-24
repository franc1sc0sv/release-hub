import type { IReleaseBranchWriteCheck } from '../interfaces/release-branch.interfaces'

export function isWritableReleaseBranch(check: IReleaseBranchWriteCheck): boolean {
  if (check.isProtected) return false
  const reservedBranches = [check.baseRef, check.repoDefaultBranch, check.defaultParentBranch]
  return !reservedBranches.includes(check.compareRef)
}
