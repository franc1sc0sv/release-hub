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
  summary: string
  noDescription: string
  allDecidedIn: (release: string) => string
}

export interface IShippedOffReport {
  html: string
  text: string
  slack: string
}

interface IFeatureGroup {
  name: string
  description: string | null
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

function toParagraphs(text: string | null | undefined): string[] {
  if (!text) return []
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function paragraphsHtml(paragraphs: string[]): string {
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
}

function flagDescription(flag: CarriedOverFlag): string[] {
  return toParagraphs(flag.addedInPullRequest?.summary)
}

function slackBold(value: string): string {
  return `*${value.trim()}*`
}

function slackItalic(value: string): string {
  return `_${value.trim()}_`
}

function clientFlagItem(name: string, description: string[]): { html: string; text: string[]; slack: string[] } {
  const joined = description.join(' ')
  return {
    html: `<li><p><strong>${escapeHtml(name)}</strong></p>${paragraphsHtml(description)}</li>`,
    text: [`- ${name}`, ...description.map((paragraph) => `  ${paragraph}`)],
    slack: [joined ? `• ${slackBold(name)} — ${joined}` : `• ${slackBold(name)}`],
  }
}

function groupByFeature(flags: CarriedOverFlag[]): { features: IFeatureGroup[]; ungrouped: CarriedOverFlag[] } {
  const byFeature = new Map<string, IFeatureGroup>()
  const ungrouped: CarriedOverFlag[] = []
  for (const flag of flags) {
    if (!flag.featureId || !flag.featureName || flag.featureKind !== FeatureKindValue.PRODUCT) {
      ungrouped.push(flag)
      continue
    }
    const group = byFeature.get(flag.featureId) ?? {
      name: flag.featureName,
      description: flag.featureDescription,
      flags: [],
    }
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
  const slack: string[] = [slackBold(labels.title), labels.intro, '']

  for (const feature of features) {
    const featureDescription = toParagraphs(feature.description)
    const items = feature.flags.map((flag) => clientFlagItem(humanizeFlagKey(flag.key), flagDescription(flag)))
    html.push(`<h3>${escapeHtml(feature.name)}</h3>`, paragraphsHtml(featureDescription))
    html.push(`<ul>${items.map((item) => item.html).join('')}</ul>`)
    html.push(`<p><em>${escapeHtml(labels.statusLine)}</em></p>`)
    text.push(feature.name, ...featureDescription, ...items.flatMap((item) => item.text), labels.statusLine, '')
    slack.push(
      slackBold(feature.name),
      ...featureDescription,
      ...items.flatMap((item) => item.slack),
      slackItalic(labels.statusLine),
      '',
    )
  }

  if (ungrouped.length > 0) {
    const items = ungrouped.map((flag) => clientFlagItem(humanizeFlagKey(flag.key), flagDescription(flag)))
    html.push(`<h3>${escapeHtml(labels.otherGroup)}</h3>`)
    html.push(`<ul>${items.map((item) => item.html).join('')}</ul>`)
    html.push(`<p><em>${escapeHtml(labels.statusLine)}</em></p>`)
    text.push(labels.otherGroup, ...items.flatMap((item) => item.text), labels.statusLine, '')
    slack.push(slackBold(labels.otherGroup), ...items.flatMap((item) => item.slack), slackItalic(labels.statusLine), '')
  }

  html.push(`<p>${escapeHtml(labels.outro)}</p>`)
  text.push(labels.outro)
  slack.push(labels.outro)

  return { html: html.join(''), text: text.join('\n'), slack: slack.join('\n') }
}

const SHORT_SUMMARY_LENGTH = 180
const CONVENTIONAL_PREFIX = /^[a-z]+(\([^)]*\))?!?$/i

function shortSummary(text: string | null | undefined): string | null {
  const sentences = toParagraphs(text).join(' ').split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length === 0) return null
  const [first, ...rest] = sentences
  if (first.length > SHORT_SUMMARY_LENGTH) {
    const cut = first.slice(0, SHORT_SUMMARY_LENGTH)
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—-]+$/, '')}…`
  }
  let summary = first
  for (const sentence of rest) {
    if (summary.length + sentence.length + 1 > SHORT_SUMMARY_LENGTH) break
    summary = `${summary} ${sentence}`
  }
  return summary
}

function shortPullRequestTitle(title: string): string {
  const prefix = title.split(':')[0].trim()
  return CONVENTIONAL_PREFIX.test(prefix) ? prefix : title
}

function sortByFeature(flags: CarriedOverFlag[]): CarriedOverFlag[] {
  return [...flags].sort((a, b) => {
    if (a.featureName === null || b.featureName === null) return Number(a.featureName === null) - Number(b.featureName === null)
    return a.featureName.localeCompare(b.featureName)
  })
}

function decidedInLabel(flag: CarriedOverFlag, labels: IShippedOffInternalLabels): string {
  return flag.decidedInThisRelease ? labels.thisRelease : flag.originReleaseName
}

export function buildInternalShippedOffReport(
  flags: CarriedOverFlag[],
  labels: IShippedOffInternalLabels,
): IShippedOffReport {
  const sorted = sortByFeature(flags)
  const decidedInValues = new Set(sorted.map((flag) => decidedInLabel(flag, labels)))
  const sharedDecidedIn = decidedInValues.size === 1 ? [...decidedInValues][0] : null
  const intro = sharedDecidedIn ? `${labels.intro} ${labels.allDecidedIn(sharedDecidedIn)}` : labels.intro

  const html: string[] = [`<h2>${escapeHtml(labels.title)}</h2>`, `<p>${escapeHtml(intro)}</p>`, '<ol>']
  const text: string[] = [labels.title, intro]
  const slack: string[] = [slackBold(labels.title), intro]

  sorted.forEach((flag, index) => {
    const decidedIn = sharedDecidedIn ? '' : ` · ${labels.decidedIn}: ${decidedInLabel(flag, labels)}`
    const feature = `${flag.featureName ?? labels.noFeature}${decidedIn}`
    const summary = shortSummary(flag.addedInPullRequest?.summary) ?? labels.noDescription
    const pr = flag.addedInPullRequest
    const prText = pr ? `#${pr.number} ${shortPullRequestTitle(pr.title)}` : labels.noPullRequest
    const prHtml = pr?.url ? `<a href="${escapeHtml(pr.url)}">${escapeHtml(prText)}</a>` : escapeHtml(prText)

    html.push(
      `<li><p><code>${escapeHtml(flag.key)}</code></p>` +
        `<p><strong>${escapeHtml(labels.feature)}:</strong> ${escapeHtml(feature)}</p>` +
        `<p><strong>${escapeHtml(labels.summary)}:</strong> ${escapeHtml(summary)}</p>` +
        `<p><strong>${escapeHtml(labels.pullRequest)}:</strong> ${prHtml}</p></li>`,
    )
    const lines = [
      `${labels.feature}: ${feature}`,
      `${labels.summary}: ${summary}`,
      `${labels.pullRequest}: ${prText}`,
    ]
    text.push('', `${index + 1}. ${flag.key}`, ...lines)
    slack.push('', `${index + 1}. \`${flag.key}\``, ...lines)
  })

  html.push('</ol>')
  return { html: html.join(''), text: text.join('\n'), slack: slack.join('\n') }
}
