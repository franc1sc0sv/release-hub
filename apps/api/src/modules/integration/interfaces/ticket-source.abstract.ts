import type { TicketSource } from '../../../common/types/ticket-source.enum'
import type { ITicketDetails } from './ticket-details.interfaces'
import type { ConfidenceSource } from '../clients/ticket-confidence'

export interface IPullRequestRef {
  branchName: string
  title: string
  body: string | null
  commitMessages: string[]
}

export interface IDetectedRef {
  issueId: string
  confidenceSource: ConfidenceSource
}

export abstract class ITicketSource {
  abstract readonly source: TicketSource
  abstract detectRefs(pr: IPullRequestRef): IDetectedRef[]
  abstract confirmIssue(issueId: string, credential: string): Promise<ITicketDetails | null>
}
