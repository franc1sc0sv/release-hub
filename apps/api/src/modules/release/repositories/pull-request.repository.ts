import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IPullRequestRepository } from '../interfaces/pull-request.repository'
import type { IUpdatePrAiFields } from '../interfaces/pull-request.repository'
import type { IPullRequest, ICreatePullRequestData, ITicketLink } from '../interfaces/release.interfaces'
import type { TicketSource } from '../../../common/types/ticket-source.enum'

type PrRow = {
  id: string
  number: number
  title: string
  body: string | null
  author: string
  mergedAt: Date
  releaseId: string
  featureId: string | null
  aiConfidence: number | null
  aiRationale: string | null
  summary: string | null
  summaryEditedAt: Date | null
  commits: Array<{
    id: string
    pullRequestId: string
    sha: string
    message: string
    author: string
    committedAt: Date
  }>
  ticketLinks: Array<{
    id: string
    pullRequestId: string
    issueId: string
    source: string
    url: string
    title: string
    description: string | null
    confidence: number
  }>
}

@Injectable()
export class PullRequestRepository extends IPullRequestRepository {
  findById = async (id: string, tx: TxClient): Promise<IPullRequest | null> => {
    const row = await tx.pullRequest.findFirst({
      where: { id },
      include: { commits: true, ticketLinks: true },
    })
    if (!row) return null
    return this.toIPullRequest(row)
  }

  findAllByRelease = async (releaseId: string, tx: TxClient): Promise<IPullRequest[]> => {
    const rows = await tx.pullRequest.findMany({
      where: { releaseId, release: { deletedAt: null } },
      include: { commits: true, ticketLinks: true },
      orderBy: { number: 'asc' },
    })
    return rows.map((row) => this.toIPullRequest(row))
  }

  assignToFeature = async (prId: string, featureId: string, tx: TxClient): Promise<IPullRequest> => {
    const row = await tx.pullRequest.update({
      where: { id: prId },
      data: { featureId },
      include: { commits: true, ticketLinks: true },
    })
    return this.toIPullRequest(row)
  }

  upsert = async (data: ICreatePullRequestData, tx: TxClient): Promise<IPullRequest> => {
    const row = await tx.pullRequest.upsert({
      where: {
        releaseId_number: {
          releaseId: data.releaseId,
          number: data.number,
        },
      },
      update: {
        title: data.title,
        body: data.body,
        author: data.author,
        mergedAt: data.mergedAt,
      },
      create: {
        number: data.number,
        title: data.title,
        body: data.body,
        author: data.author,
        mergedAt: data.mergedAt,
        releaseId: data.releaseId,
      },
      include: { commits: true, ticketLinks: true },
    })
    return this.toIPullRequest(row)
  }

  updateAiFields = async (prId: string, fields: IUpdatePrAiFields, tx: TxClient): Promise<IPullRequest> => {
    const row = await tx.pullRequest.update({
      where: { id: prId },
      data: {
        featureId: fields.featureId,
        aiConfidence: fields.aiConfidence,
        aiRationale: fields.aiRationale,
      },
      include: { commits: true, ticketLinks: true },
    })
    return this.toIPullRequest(row)
  }

  updateSummary = async (
    prId: string,
    summary: string,
    summaryEditedAt: Date | null,
    tx: TxClient,
  ): Promise<IPullRequest> => {
    const row = await tx.pullRequest.update({
      where: { id: prId },
      data: { summary, summaryEditedAt },
      include: { commits: true, ticketLinks: true },
    })
    return this.toIPullRequest(row)
  }

  clearFeatureAssignment = async (featureId: string, tx: TxClient): Promise<void> => {
    await tx.pullRequest.updateMany({
      where: { featureId },
      data: { featureId: null },
    })
  }

  clearReleaseAssignments = async (releaseId: string, tx: TxClient): Promise<void> => {
    await tx.pullRequest.updateMany({
      where: { releaseId },
      data: { featureId: null, aiConfidence: null, aiRationale: null },
    })
  }

  private toITicketLink(row: {
    id: string
    pullRequestId: string
    issueId: string
    source: string
    url: string
    title: string
    description: string | null
    confidence: number
  }): ITicketLink {
    return {
      id: row.id,
      pullRequestId: row.pullRequestId,
      issueId: row.issueId,
      source: row.source as TicketSource,
      url: row.url,
      title: row.title,
      description: row.description,
      confidence: row.confidence,
    }
  }

  private toIPullRequest(row: PrRow): IPullRequest {
    return {
      id: row.id,
      number: row.number,
      title: row.title,
      body: row.body,
      author: row.author,
      mergedAt: row.mergedAt,
      releaseId: row.releaseId,
      featureId: row.featureId,
      aiConfidence: row.aiConfidence,
      aiRationale: row.aiRationale,
      summary: row.summary,
      summaryEditedAt: row.summaryEditedAt,
      commits: row.commits.map((c) => ({
        id: c.id,
        pullRequestId: c.pullRequestId,
        sha: c.sha,
        message: c.message,
        author: c.author,
        committedAt: c.committedAt,
      })),
      ticketLinks: row.ticketLinks.map((t) => this.toITicketLink(t)),
    }
  }
}
