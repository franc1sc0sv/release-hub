import { FeatureKindValue } from '@/features/features/constants/feature-enums'
import type { CarriedOverFlagsQuery } from '@/generated/graphql'

type CarriedOverFlag = CarriedOverFlagsQuery['carriedOverFlags'][number]

export const ShippedOffAudienceValue = {
  CLIENT: 'client',
  INTERNAL: 'internal',
} as const

export type ShippedOffAudience = (typeof ShippedOffAudienceValue)[keyof typeof ShippedOffAudienceValue]

export interface IShippedOffClientLabels {
  title: string
  intro: string
  statusLine: string
  otherGroup: string
  outro: string
}

export interface IShippedOffInternalLabels {
  title: string
  intro: string
  feature: string
  decidedIn: string
  pullRequest: string
  noFeature: string
  noPullRequest: string
  thisRelease: string
}

export interface IShippedOffReport {
  html: string
  text: string
}

interface IFeatureGroup {
  name: string
  flags: CarriedOverFlag[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function humanizeFlagKey(key: string): string {
  const words = key.replace(/^enable_/, '').split('_').filter(Boolean).join(' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function groupByFeature(flags: CarriedOverFlag[]): { features: IFeatureGroup[]; ungrouped: CarriedOverFlag[] } {
  const byFeature = new Map<string, IFeatureGroup>()
  const ungrouped: CarriedOverFlag[] = []
  for (const flag of flags) {
    if (!flag.featureId || !flag.featureName || flag.featureKind !== FeatureKindValue.PRODUCT) {
      ungrouped.push(flag)
      continue
    }
    const group = byFeature.get(flag.featureId) ?? { name: flag.featureName, flags: [] }
    group.flags.push(flag)
    byFeature.set(flag.featureId, group)
  }
  return {
    features: [...byFeature.values()].sort((a, b) => a.name.localeCompare(b.name)),
    ungrouped,
  }
}

export function buildClientShippedOffReport(
  flags: CarriedOverFlag[],
  labels: IShippedOffClientLabels,
): IShippedOffReport {
  const { features, ungrouped } = groupByFeature(flags)
  const html: string[] = [`<h2>${escapeHtml(labels.title)}</h2>`, `<p>${escapeHtml(labels.intro)}</p>`]
  const text: string[] = [labels.title, '', labels.intro, '']

  for (const feature of features) {
    html.push(`<h3>${escapeHtml(feature.name)}</h3>`)
    text.push(feature.name)
    html.push(`<p><em>${escapeHtml(labels.statusLine)}</em></p>`)
    text.push(labels.statusLine, '')
  }

  if (ungrouped.length > 0) {
    const names = ungrouped.map((flag) => humanizeFlagKey(flag.key))
    html.push(`<h3>${escapeHtml(labels.otherGroup)}</h3>`)
    html.push(`<ul>${names.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul>`)
    html.push(`<p><em>${escapeHtml(labels.statusLine)}</em></p>`)
    text.push(labels.otherGroup, ...names.map((name) => `- ${name}`), labels.statusLine, '')
  }

  html.push(`<p>${escapeHtml(labels.outro)}</p>`)
  text.push(labels.outro)

  return { html: html.join(''), text: text.join('\n') }
}

export function buildInternalShippedOffReport(
  flags: CarriedOverFlag[],
  labels: IShippedOffInternalLabels,
): IShippedOffReport {
  const sorted = [...flags].sort((a, b) => {
    if (a.featureName === null || b.featureName === null) return Number(a.featureName === null) - Number(b.featureName === null)
    return a.featureName.localeCompare(b.featureName)
  })
  const html: string[] = [`<h2>${escapeHtml(labels.title)}</h2>`, `<p>${escapeHtml(labels.intro)}</p>`, '<ul>']
  const text: string[] = [labels.title, '', labels.intro, '']

  for (const flag of sorted) {
    const feature = flag.featureName ?? labels.noFeature
    const decidedIn = flag.decidedInThisRelease ? labels.thisRelease : flag.originReleaseName
    const pr = flag.addedInPullRequest
    const prText = pr ? `#${pr.number} ${pr.title}${pr.url ? ` (${pr.url})` : ''}` : labels.noPullRequest
    const prHtml = pr
      ? pr.url
        ? `<a href="${escapeHtml(pr.url)}">#${pr.number} ${escapeHtml(pr.title)}</a>`
        : `#${pr.number} ${escapeHtml(pr.title)}`
      : escapeHtml(labels.noPullRequest)

    html.push(
      `<li><p><code>${escapeHtml(flag.key)}</code></p>` +
        `<p><strong>${escapeHtml(labels.feature)}:</strong> ${escapeHtml(feature)} · ` +
        `<strong>${escapeHtml(labels.decidedIn)}:</strong> ${escapeHtml(decidedIn)}</p>` +
        `<p><strong>${escapeHtml(labels.pullRequest)}:</strong> ${prHtml}</p></li>`,
    )
    text.push(
      `- ${flag.key}`,
      `  ${labels.feature}: ${feature} · ${labels.decidedIn}: ${decidedIn}`,
      `  ${labels.pullRequest}: ${prText}`,
    )
  }

  html.push('</ul>')
  return { html: html.join(''), text: text.join('\n') }
}
