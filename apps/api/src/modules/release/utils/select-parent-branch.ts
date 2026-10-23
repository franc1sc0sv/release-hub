import type { IParentBranchComparison } from '../interfaces/release-branch.interfaces'

export function selectParentBranch(
  comparisons: readonly IParentBranchComparison[],
): IParentBranchComparison | null {
  let best: IParentBranchComparison | null = null
  for (const comparison of comparisons) {
    if (best === null) {
      best = comparison
      continue
    }
    const closer =
      comparison.aheadBy < best.aheadBy ||
      (comparison.aheadBy === best.aheadBy && comparison.behindBy < best.behindBy)
    if (closer) best = comparison
  }
  return best
}
