export const TicketConfidence = {
  BRANCH: 0.95,
  TITLE: 0.6,
  BODY: 0.6,
  COMMIT: 0.5,
} as const

export type ConfidenceSource = 'branch' | 'title' | 'body' | 'commit'

export function resolveConfidence(source: ConfidenceSource): number {
  if (source === 'branch') return TicketConfidence.BRANCH
  if (source === 'title') return TicketConfidence.TITLE
  if (source === 'body') return TicketConfidence.BODY
  return TicketConfidence.COMMIT
}
