import type { TicketSource } from '../../../common/types/ticket-source.enum'

export interface ITicketDetails {
  issueId: string
  url: string
  title: string
  description: string
}

export interface ITicketEnrichmentResult {
  pullRequestId: string
  issueId: string
  url: string
  title: string
  description: string
  source: TicketSource
  confidence: number
}
