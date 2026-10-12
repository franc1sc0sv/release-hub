import { describe, expect, it } from 'vitest'
import {
  ensureSummaryReferences,
  featureInReleaseUrl,
  featureTitleLink,
  flagUrl,
  flagsInline,
  flagsParagraph,
  pullRequestTitleLink,
} from './summary-links'

const scope = { organizationId: 'org', projectId: 'proj', releaseId: 'rel' }

function toFlags(flagKeys: string[]) {
  return flagKeys.map((key) => ({ key, url: flagUrl(scope, key) }))
}

function summaryFeature(id: string, flagKeys: string[]) {
  return {
    featureId: id,
    name: `Feature ${id}`,
    description: '',
    kind: 'product',
    statusLine: '',
    prSummaries: [],
    url: featureInReleaseUrl(scope, id),
    flags: toFlags(flagKeys),
    pullRequests: [],
  }
}

describe('ensureSummaryReferences', () => {
  const first = summaryFeature('a', ['enable_a'])
  const second = summaryFeature('b', ['enable_b1', 'enable_b2'])

  it('keeps a summary that already links every feature and flag', () => {
    const html = `<ul><li>${featureTitleLink(first, 'A')}${flagsParagraph(first.flags)}</li><li>${featureTitleLink(second, 'B')}${flagsParagraph(second.flags)}</li></ul>`

    expect(ensureSummaryReferences(html, [first, second])).toBe(html)
  })

  it('adds a reference for a feature that misses a flag link', () => {
    const html = `<ul><li>${featureTitleLink(first, 'A')}${flagsParagraph(first.flags)}</li><li>${featureTitleLink(second, 'B')}${flagsParagraph([second.flags[0]])}</li></ul>`

    const result = ensureSummaryReferences(html, [first, second])

    expect(result.slice(html.length)).toBe(
      `<h2>References</h2><ul><li>${featureTitleLink(second, second.name)}${flagsParagraph(second.flags)}</li></ul>`,
    )
  })

  it('adds a reference when a bug fix item misses its pull request flag', () => {
    const bugs = {
      ...summaryFeature('bugs', []),
      kind: 'default',
      pullRequests: [
        { summary: 'Fix one', url: 'https://github.com/acme/repo/pull/1', flags: toFlags(['enable_fix_one']) },
        { summary: 'Fix two', url: 'https://github.com/acme/repo/pull/2', flags: [] },
      ],
    }
    const firstItem = `<li>${pullRequestTitleLink(bugs.pullRequests[0].url, 'Fix one')} — Fixed a bug.</li>`
    const complete = `<ul><li>${featureTitleLink(bugs, 'Bugs')}<ul>${firstItem.replace('</li>', ` ${flagsInline(bugs.pullRequests[0].flags)}</li>`)}</ul></li></ul>`
    const missing = `<ul><li>${featureTitleLink(bugs, 'Bugs')}<ul>${firstItem}</ul></li></ul>`

    expect(ensureSummaryReferences(complete, [bugs])).toBe(complete)
    expect(ensureSummaryReferences(missing, [bugs])).toContain(flagsParagraph(bugs.pullRequests[0].flags))
  })

  it('adds no flag line for a feature without flags', () => {
    const plain = summaryFeature('c', [])

    expect(ensureSummaryReferences('<p>Intro</p>', [plain])).toBe(
      `<p>Intro</p><h2>References</h2><ul><li>${featureTitleLink(plain, plain.name)}</li></ul>`,
    )
  })
})
