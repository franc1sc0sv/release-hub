import { describe, expect, it } from 'vitest'
import { buildParentCandidates } from './parent-branch-candidates'

describe('buildParentCandidates', () => {
  it('orders the project default, the known names, the repo default and the base ref', () => {
    expect(
      buildParentCandidates({
        defaultParentBranch: 'integration',
        repoDefaultBranch: 'trunk',
        baseRef: 'main',
        compareRef: 'release/23-october-2026',
      }),
    ).toEqual(['integration', 'dev', 'develop', 'development', 'staging', 'trunk', 'main'])
  })

  it('removes duplicates, empty values and the compare ref', () => {
    expect(
      buildParentCandidates({
        defaultParentBranch: ' dev ',
        repoDefaultBranch: 'dev',
        baseRef: 'staging',
        compareRef: 'develop',
      }),
    ).toEqual(['dev', 'development', 'staging'])
  })

  it('skips a missing project default', () => {
    expect(
      buildParentCandidates({
        defaultParentBranch: null,
        repoDefaultBranch: '',
        baseRef: 'main',
        compareRef: 'release/x',
      }),
    ).toEqual(['dev', 'develop', 'development', 'staging', 'main'])
  })
})
