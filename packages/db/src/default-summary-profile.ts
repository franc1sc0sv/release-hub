import { SummaryExampleKind } from './generated/client/enums'

export interface IDefaultSummaryProfileRule {
  content: string
  position: number
}

export interface IDefaultSummaryProfileExample {
  kind: typeof SummaryExampleKind.good | typeof SummaryExampleKind.bad
  content: string
  explanation: string
  position: number
}

export interface IDefaultSummaryProfileDefinition {
  name: string
  description: string
  outputTemplate: string
  rules: IDefaultSummaryProfileRule[]
  examples: IDefaultSummaryProfileExample[]
}

export const DEFAULT_SUMMARY_PROFILE: IDefaultSummaryProfileDefinition = {
  name: 'Default',
  description: 'A clear, client-friendly starting point for release summaries.',
  outputTemplate:
    '<p>This release brings a handful of improvements focused on making your day-to-day work smoother and more reliable.</p><h2>Faster project search</h2><p>You can now find projects instantly as you type, with results ranked by relevance. This is <strong>available now</strong> and requires no setup on your end.</p>',
  rules: [
    {
      content: 'Write in plain, non-technical language a client can understand without engineering context.',
      position: 0,
    },
    {
      content: 'Keep each feature section to 2-4 sentences — lead with the client benefit, not the implementation.',
      position: 1,
    },
    {
      content: 'Use a colored highlight (from the allowed palette) only for the single most important word or phrase per section, never more.',
      position: 2,
    },
  ],
  examples: [
    {
      kind: SummaryExampleKind.good,
      content:
        '<h2>Faster project search</h2><p>Finding the right project is now instant — start typing and results appear as you go. This is <strong>available now</strong> in your workspace.</p>',
      explanation: 'Leads with the benefit, stays short, uses one bold emphasis, and states availability plainly.',
      position: 0,
    },
    {
      kind: SummaryExampleKind.bad,
      content:
        '<h2>Search Optimization</h2><p>We refactored the search indexing pipeline to use a new inverted-index data structure with debounced client-side queries, reducing p95 latency by 340ms across our Elasticsearch cluster.</p>',
      explanation: 'Technical jargon and implementation detail a client cannot act on; no clear client-facing benefit.',
      position: 0,
    },
  ],
}
