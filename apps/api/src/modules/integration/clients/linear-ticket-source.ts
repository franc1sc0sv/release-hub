import { Injectable } from '@nestjs/common'
import { ITicketSource, type IPullRequestRef, type IDetectedRef } from '../interfaces/ticket-source.abstract'
import type { ITicketDetails } from '../interfaces/ticket-details.interfaces'
import { TicketSource } from '../../../common/types/ticket-source.enum'

const LINEAR_TICKET_REGEX = /\b([A-Z][A-Z0-9]+-\d+)\b/g
const LINEAR_COMMIT_FEAT_REGEX = /\bfeat\(([A-Z0-9]+-\d+)\)/g
const LINEAR_GRAPHQL_URL = 'https://api.linear.app/graphql' as const

const ISSUE_QUERY = `
  query IssueByIdentifier($identifier: String!) {
    issue(id: $identifier) {
      id
      identifier
      url
      title
      description
    }
  }
` as const

interface LinearIssueResponse {
  data?: {
    issue?: {
      id: string
      identifier: string
      url: string
      title: string
      description: string | null
    } | null
  }
  errors?: { message: string }[]
}

@Injectable()
export class LinearTicketSource extends ITicketSource {
  readonly source = TicketSource.LINEAR

  detectRefs(pr: IPullRequestRef): IDetectedRef[] {
    const seen = new Set<string>()
    const results: IDetectedRef[] = []

    const addIfNew = (issueId: string, confidenceSource: IDetectedRef['confidenceSource']): void => {
      if (!seen.has(issueId)) {
        seen.add(issueId)
        results.push({ issueId, confidenceSource })
      }
    }

    const branchMatches = pr.branchName.toUpperCase().matchAll(LINEAR_TICKET_REGEX)
    for (const match of branchMatches) {
      if (match[1]) addIfNew(match[1], 'branch')
    }

    const titleMatches = pr.title.toUpperCase().matchAll(LINEAR_TICKET_REGEX)
    for (const match of titleMatches) {
      if (match[1]) addIfNew(match[1], 'title')
    }

    const body = pr.body ?? ''
    const bodyMatches = body.toUpperCase().matchAll(LINEAR_TICKET_REGEX)
    for (const match of bodyMatches) {
      if (match[1]) addIfNew(match[1], 'body')
    }

    for (const msg of pr.commitMessages) {
      const commitMatches = msg.matchAll(LINEAR_COMMIT_FEAT_REGEX)
      for (const match of commitMatches) {
        if (match[1]) addIfNew(match[1].toUpperCase(), 'commit')
      }
    }

    return results
  }

  async confirmIssue(issueId: string, credential: string): Promise<ITicketDetails | null> {
    try {
      const response = await fetch(LINEAR_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credential}`,
        },
        body: JSON.stringify({
          query: ISSUE_QUERY,
          variables: { identifier: issueId },
        }),
      })

      if (!response.ok) return null

      const payload = (await response.json()) as LinearIssueResponse

      if (payload.errors?.length) return null

      const issue = payload.data?.issue
      if (!issue) return null

      return {
        issueId: issue.identifier,
        url: issue.url,
        title: issue.title,
        description: issue.description ?? '',
      }
    } catch {
      return null
    }
  }
}
