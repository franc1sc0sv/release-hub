import { describe, expect, it } from 'vitest'
import { selectParentBranch } from './select-parent-branch'

describe('selectParentBranch', () => {
  it('returns null when there are no comparisons', () => {
    expect(selectParentBranch([])).toBeNull()
  })

  it('picks the comparison with the fewest release own commits', () => {
    const selected = selectParentBranch([
      { ref: 'main', aheadBy: 12, behindBy: 0 },
      { ref: 'dev', aheadBy: 0, behindBy: 9 },
      { ref: 'staging', aheadBy: 3, behindBy: 1 },
    ])
    expect(selected?.ref).toBe('dev')
  })

  it('breaks an aheadBy tie with the fewest missing parent commits', () => {
    const selected = selectParentBranch([
      { ref: 'dev', aheadBy: 0, behindBy: 5 },
      { ref: 'staging', aheadBy: 0, behindBy: 2 },
    ])
    expect(selected?.ref).toBe('staging')
  })

  it('keeps the earlier candidate when both counts tie', () => {
    const selected = selectParentBranch([
      { ref: 'dev', aheadBy: 1, behindBy: 4 },
      { ref: 'develop', aheadBy: 1, behindBy: 4 },
    ])
    expect(selected?.ref).toBe('dev')
  })
})
