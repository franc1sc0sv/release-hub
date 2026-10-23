import type { IParentCandidatesInput } from '../interfaces/release-branch.interfaces'

export const DEFAULT_PARENT_BRANCH_CANDIDATES = ['dev', 'develop', 'development', 'staging'] as const

export function buildParentCandidates(input: IParentCandidatesInput): string[] {
  const ordered = [
    input.defaultParentBranch,
    ...DEFAULT_PARENT_BRANCH_CANDIDATES,
    input.repoDefaultBranch,
    input.baseRef,
  ]
  const unique = new Set<string>()
  for (const candidate of ordered) {
    const trimmed = candidate?.trim() ?? ''
    if (trimmed.length === 0 || trimmed === input.compareRef) continue
    unique.add(trimmed)
  }
  return [...unique]
}
