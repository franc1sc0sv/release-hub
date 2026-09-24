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
  featureDescription: string
  flagDescription: string
  noDescription: string
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
  const slack: string[] = [slackBold(labels.title), labels.intro]

  for (const flag of sorted) {
    const feature = flag.featureName ?? labels.noFeature
    const featureDescription = toParagraphs(flag.featureDescription).join(' ') || labels.noDescription
    const description = flagDescription(flag).join(' ') || labels.noDescription
    const decidedIn = flag.decidedInThisRelease ? labels.thisRelease : flag.originReleaseName
    const pr = flag.addedInPullRequest
    const prText = pr ? `#${pr.number} ${pr.title}${pr.url ? ` (${pr.url})` : ''}` : labels.noPullRequest
    const prSlack = pr ? `#${pr.number} ${pr.title}${pr.url ? ` — ${pr.url}` : ''}` : labels.noPullRequest
    const prHtml = pr
      ? pr.url
        ? `<a href="${escapeHtml(pr.url)}">#${pr.number} ${escapeHtml(pr.title)}</a>`
        : `#${pr.number} ${escapeHtml(pr.title)}`
      : escapeHtml(labels.noPullRequest)

    html.push(
      `<li><p><code>${escapeHtml(flag.key)}</code></p>` +
        `<p><strong>${escapeHtml(labels.feature)}:</strong> ${escapeHtml(feature)} · ` +
        `<strong>${escapeHtml(labels.decidedIn)}:</strong> ${escapeHtml(decidedIn)}</p>` +
        (flag.featureName
          ? `<p><strong>${escapeHtml(labels.featureDescription)}:</strong> ${escapeHtml(featureDescription)}</p>`
          : '') +
        `<p><strong>${escapeHtml(labels.flagDescription)}:</strong> ${escapeHtml(description)}</p>` +
        `<p><strong>${escapeHtml(labels.pullRequest)}:</strong> ${prHtml}</p></li>`,
    )
    text.push(
      `- ${flag.key}`,
      `  ${labels.feature}: ${feature} · ${labels.decidedIn}: ${decidedIn}`,
      ...(flag.featureName ? [`  ${labels.featureDescription}: ${featureDescription}`] : []),
      `  ${labels.flagDescription}: ${description}`,
      `  ${labels.pullRequest}: ${prText}`,
    )
    slack.push(
      '',
      `• \`${flag.key}\``,
      `     ${slackBold(`${labels.feature}:`)} ${feature}  ·  ${slackBold(`${labels.decidedIn}:`)} ${decidedIn}`,
      ...(flag.featureName ? [`     ${slackBold(`${labels.featureDescription}:`)} ${featureDescription}`] : []),
      `     ${slackBold(`${labels.flagDescription}:`)} ${description}`,
      `     ${slackBold(`${labels.pullRequest}:`)} ${prSlack}`,
    )
  }

  html.push('</ul>')
  return { html: html.join(''), text: text.join('\n'), slack: slack.join('\n') }
}
