import type { IGitHubClient } from '../../integration/interfaces/github-client.interface'
import type {
  IParentBranchComparison,
  IReleaseParentSource,
  IResolvedReleaseParent,
} from '../interfaces/release-branch.interfaces'
import { buildParentCandidates } from './parent-branch-candidates'
import { selectParentBranch } from './select-parent-branch'

async function compareToRelease(
  gitHubClient: IGitHubClient,
  source: IReleaseParentSource,
  parentRef: string,
): Promise<IParentBranchComparison | null> {
  try {
    const comparison = await gitHubClient.compareRefs(
      source.repo,
      parentRef,
      source.compareRef,
      source.accessToken,
    )
    return { ref: parentRef, aheadBy: comparison.aheadBy, behindBy: comparison.behindBy }
  } catch {
    return null
  }
}

export async function resolveReleaseParent(
  gitHubClient: IGitHubClient,
  source: IReleaseParentSource,
): Promise<IResolvedReleaseParent> {
  if (source.storedSourceRef) {
    const comparison = await gitHubClient.compareRefs(
      source.repo,
      source.storedSourceRef,
      source.compareRef,
      source.accessToken,
    )
    return {
      sourceRef: source.storedSourceRef,
      detected: false,
      behindBy: comparison.behindBy,
      ownCommits: comparison.aheadBy,
    }
  }

  const repoDefaultBranch = await gitHubClient.getDefaultBranch(source.repo, source.accessToken)
  const candidates = buildParentCandidates({
    defaultParentBranch: source.defaultParentBranch,
    repoDefaultBranch,
    baseRef: source.baseRef,
    compareRef: source.compareRef,
  })
  const results = await Promise.all(
    candidates.map((candidate) => compareToRelease(gitHubClient, source, candidate)),
  )
  const comparisons = results.filter(
    (result): result is IParentBranchComparison => result !== null,
  )
  const selected = selectParentBranch(comparisons)

  if (!selected) return { sourceRef: null, detected: false, behindBy: 0, ownCommits: 0 }
  return {
    sourceRef: selected.ref,
    detected: true,
    behindBy: selected.behindBy,
    ownCommits: selected.aheadBy,
  }
}
