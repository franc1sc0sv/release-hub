import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { TicketSource } from '../../../common/types/ticket-source.enum'
import type { ITicketEnrichmentResult } from './ticket-details.interfaces'

export interface ITicketLink {
  id: string
  pullRequestId: string
  issueId: string
  source: TicketSource
  url: string
  title: string
  description: string | null
  confidence: number
}

export abstract class ITicketLinkRepository implements IBaseRepository<ITicketLink> {
  abstract findById: RepositoryMethod<[id: string], ITicketLink | null>
  abstract findAllByPullRequestId: RepositoryMethod<[pullRequestId: string], ITicketLink[]>
  abstract upsertForPr: RepositoryMethod<[data: ITicketEnrichmentResult], ITicketLink>
}
