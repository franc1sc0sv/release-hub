import type { IPullRequest, ICommit, IRelease, ITicketLink } from '../interfaces/release.interfaces'
import type { IGitHubMergedPr } from '../../integration/interfaces/github-client.interface'
import { PullRequestType } from './pull-request.type'
import { CommitType } from './commit.type'
import { ReleaseObjectType } from './release.type'
import { TicketLinkType } from './ticket-link.type'

export function toCommitType(commit: ICommit): CommitType {
  const type = new CommitType()
  type.sha = commit.sha
  type.message = commit.message
  type.author = commit.author
  type.date = commit.committedAt
  return type
}

function toTicketLinkType(ticket: ITicketLink): TicketLinkType {
  const type = new TicketLinkType()
  type.issueId = ticket.issueId
  type.source = ticket.source
  type.url = ticket.url
  type.title = ticket.title
  type.description = ticket.description
  type.confidence = ticket.confidence
  return type
}

export function toPullRequestType(pr: IPullRequest): PullRequestType {
  const type = new PullRequestType()
  type.id = pr.id
  type.number = pr.number
  type.title = pr.title
  type.body = pr.body
  type.author = pr.author
  type.mergedAt = pr.mergedAt
  type.releaseId = pr.releaseId
  type.featureId = pr.featureId
  type.aiConfidence = pr.aiConfidence
  type.aiRationale = pr.aiRationale
  type.summary = pr.summary
  type.summaryEditedAt = pr.summaryEditedAt
  type.commits = pr.commits.map(toCommitType)
  type.tickets = pr.ticketLinks.map(toTicketLinkType)
  return type
}

export function toReleaseObjectType(release: IRelease): ReleaseObjectType {
  const type = new ReleaseObjectType()
  type.id = release.id
  type.projectId = release.projectId
  type.name = release.name
  type.baseRef = release.baseRef
  type.compareRef = release.compareRef
  type.status = release.status
  type.aiDraftStatus = release.aiDraftStatus
  type.prUrl = release.prUrl
  type.tags = release.tags
  type.summary = release.summary
  type.summaryEditedAt = release.summaryEditedAt
  type.createdAt = release.createdAt
  type.updatedAt = release.updatedAt
  return type
}

export function githubPrToPullRequestType(
  pr: IGitHubMergedPr,
  tickets: TicketLinkType[] = [],
): PullRequestType {
  const type = new PullRequestType()
  type.id = ''
  type.number = pr.number
  type.title = pr.title
  type.body = pr.body
  type.author = pr.author
  type.mergedAt = pr.mergedAt
  type.releaseId = null
  type.featureId = null
  type.aiConfidence = null
  type.aiRationale = null
  type.summary = null
  type.summaryEditedAt = null
  type.tickets = tickets
  type.commits = pr.commits.map((c) => {
    const commit = new CommitType()
    commit.sha = c.sha
    commit.message = c.message
    commit.author = c.author
    commit.date = c.committedAt
    return commit
  })
  return type
}
