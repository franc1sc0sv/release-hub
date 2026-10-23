import { describe, expect, it } from 'vitest'
import { BranchUpdateMethod } from '../../../common/types/branch-update-method.enum'
import { BranchUpdateAction } from '../interfaces/release-branch.interfaces'
import { decideBranchUpdate } from './decide-branch-update'

describe('decideBranchUpdate', () => {
  it('does nothing when the parent has no new commits', () => {
    expect(decideBranchUpdate({ method: BranchUpdateMethod.REBASE, behindBy: 0, ownCommits: 0 })).toBe(
      BranchUpdateAction.NOTHING,
    )
    expect(decideBranchUpdate({ method: BranchUpdateMethod.MERGE, behindBy: 0, ownCommits: 4 })).toBe(
      BranchUpdateAction.NOTHING,
    )
  })

  it('fast-forwards with the rebase method when the release has no own commits', () => {
    expect(decideBranchUpdate({ method: BranchUpdateMethod.REBASE, behindBy: 3, ownCommits: 0 })).toBe(
      BranchUpdateAction.FAST_FORWARD,
    )
  })

  it('refuses with the rebase method when the release has own commits', () => {
    expect(decideBranchUpdate({ method: BranchUpdateMethod.REBASE, behindBy: 3, ownCommits: 2 })).toBe(
      BranchUpdateAction.REFUSE,
    )
  })

  it('merges with the merge method whatever the own commits are', () => {
    expect(decideBranchUpdate({ method: BranchUpdateMethod.MERGE, behindBy: 3, ownCommits: 0 })).toBe(
      BranchUpdateAction.MERGE,
    )
    expect(decideBranchUpdate({ method: BranchUpdateMethod.MERGE, behindBy: 3, ownCommits: 7 })).toBe(
      BranchUpdateAction.MERGE,
    )
  })
})
