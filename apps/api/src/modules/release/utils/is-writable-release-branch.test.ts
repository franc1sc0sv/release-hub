import { describe, expect, it } from 'vitest'
import { isWritableReleaseBranch } from './is-writable-release-branch'

const releaseBranch = {
  compareRef: 'release/23-october-2026',
  baseRef: 'main',
  repoDefaultBranch: 'main',
  defaultParentBranch: 'dev',
  isProtected: false,
}

describe('isWritableReleaseBranch', () => {
  it('allows an unprotected release branch', () => {
    expect(isWritableReleaseBranch(releaseBranch)).toBe(true)
  })

  it('allows a release branch when the project has no default parent branch', () => {
    expect(isWritableReleaseBranch({ ...releaseBranch, defaultParentBranch: null })).toBe(true)
  })

  it('refuses a protected branch', () => {
    expect(isWritableReleaseBranch({ ...releaseBranch, isProtected: true })).toBe(false)
  })

  it('refuses the release base branch', () => {
    expect(isWritableReleaseBranch({ ...releaseBranch, compareRef: 'production', baseRef: 'production' })).toBe(false)
  })

  it('refuses the repository default branch', () => {
    expect(isWritableReleaseBranch({ ...releaseBranch, compareRef: 'main', baseRef: 'staging' })).toBe(false)
  })

  it('refuses the project default parent branch', () => {
    expect(isWritableReleaseBranch({ ...releaseBranch, compareRef: 'dev' })).toBe(false)
  })
})
