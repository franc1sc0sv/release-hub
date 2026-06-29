import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ITicketLinkRepository, type ITicketLink } from '../interfaces/ticket-link.repository'
import type { ITicketEnrichmentResult } from '../interfaces/ticket-details.interfaces'
import type { TicketSource } from '../../../common/types/ticket-source.enum'

@Injectable()
export class TicketLinkRepository extends ITicketLinkRepository {
  findById = async (id: string, tx: TxClient): Promise<ITicketLink | null> => {
    const row = await tx.ticketLink.findUnique({ where: { id } })
    if (!row) return null
    return this.toITicketLink(row)
  }

  findAllByPullRequestId = async (
    pullRequestId: string,
    tx: TxClient,
  ): Promise<ITicketLink[]> => {
    const rows = await tx.ticketLink.findMany({ where: { pullRequestId } })
    return rows.map((row) => this.toITicketLink(row))
  }

  upsertForPr = async (data: ITicketEnrichmentResult, tx: TxClient): Promise<ITicketLink> => {
    const existing = await tx.ticketLink.findFirst({
      where: { pullRequestId: data.pullRequestId, issueId: data.issueId },
    })
    const row = existing
      ? await tx.ticketLink.update({
          where: { id: existing.id },
          data: {
            source: data.source,
            url: data.url,
            title: data.title,
            description: data.description,
            confidence: data.confidence,
          },
        })
      : await tx.ticketLink.create({
          data: {
            pullRequestId: data.pullRequestId,
            issueId: data.issueId,
            source: data.source,
            url: data.url,
            title: data.title,
            description: data.description,
            confidence: data.confidence,
          },
        })
    return this.toITicketLink(row)
  }

  private toITicketLink(row: {
    id: string
    pullRequestId: string
    issueId: string
    source: TicketSource
    url: string
    title: string
    description: string | null
    confidence: number
  }): ITicketLink {
    return {
      id: row.id,
      pullRequestId: row.pullRequestId,
      issueId: row.issueId,
      source: row.source,
      url: row.url,
      title: row.title,
      description: row.description,
      confidence: row.confidence,
    }
  }
}
