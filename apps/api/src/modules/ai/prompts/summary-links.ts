import { escapeHtml } from '../../../common/text/escape-html'
import type { IAiStreamSummaryInput, IAiSummaryFlag } from '../interfaces/ai-provider.abstract'
import { FeatureKind } from '../../../common/types/feature-kind.enum'

type SummaryFeature = IAiStreamSummaryInput['features'][number]

interface ISummaryLinkScope {
  organizationId: string
  projectId: string
  releaseId: string
}

const WEB_APP_URL = (process.env.WEB_APP_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

export function featureInReleaseUrl(scope: ISummaryLinkScope, featureId: string): string {
  return `${WEB_APP_URL}/${scope.organizationId}/${scope.projectId}/features/${featureId}#release-${scope.releaseId}`
}

export function flagUrl(scope: ISummaryLinkScope, key: string): string {
  return `${WEB_APP_URL}/${scope.organizationId}/${scope.projectId}/flags/${encodeURIComponent(key)}`
}

export function featureTitleLink(feature: SummaryFeature, title: string): string {
  const strongTitle = `<strong>${escapeHtml(title)}</strong>`
  return feature.url ? `<a href="${escapeHtml(feature.url)}">${strongTitle}</a>` : strongTitle
}

export function pullRequestUrl(repo: string, number: number): string | null {
  return repo ? `https://github.com/${repo}/pull/${number}` : null
}

export function pullRequestTitleLink(url: string | null, title: string): string {
  const strongTitle = `<strong>${escapeHtml(title)}</strong>`
  return url ? `<a href="${escapeHtml(url)}">${strongTitle}</a>` : strongTitle
}

export function flagsInline(flags: IAiSummaryFlag[]): string {
  if (flags.length === 0) return ''
  const links = flags
    .map((flag) => `<a href="${escapeHtml(flag.url)}"><code>${escapeHtml(flag.key)}</code></a>`)
    .join(', ')
  return `<strong>Feature flags:</strong> ${links}`
}

export function flagsParagraph(flags: IAiSummaryFlag[]): string {
  const inline = flagsInline(flags)
  return inline ? `<p>${inline}</p>` : ''
}

export function usesPullRequestItems(feature: SummaryFeature): boolean {
  return feature.kind === FeatureKind.DEFAULT
}

export function allFeatureFlags(feature: SummaryFeature): IAiSummaryFlag[] {
  return [...feature.flags, ...feature.pullRequests.flatMap((pr) => pr.flags)]
}

function hasLink(html: string, url: string): boolean {
  return html.includes(`href="${escapeHtml(url)}"`) || html.includes(`href="${url}"`)
}

export function ensureSummaryReferences(html: string, features: SummaryFeature[]): string {
  const incomplete = features.filter(
    (feature) =>
      (feature.url !== null && !hasLink(html, feature.url)) ||
      allFeatureFlags(feature).some((flag) => !hasLink(html, flag.url)),
  )
  if (incomplete.length === 0) return html

  const items = incomplete
    .map((feature) => `<li>${featureTitleLink(feature, feature.name)}${flagsParagraph(allFeatureFlags(feature))}</li>`)
    .join('')
  return `${html}<h2>References</h2><ul>${items}</ul>`
}
