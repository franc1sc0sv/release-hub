import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient, type IGitHubMergedPr } from '../../../integration/interfaces/github-client.interface'
import { ITicketSource } from '../../../integration/interfaces/ticket-source.abstract'
import { resolveConfidence } from '../../../integration/clients/ticket-confidence'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { ILinearConnectionRepository } from '../../../linear-auth/interfaces/linear-connection.repository'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { PullRequestType } from '../../types/pull-request.type'
import { TicketLinkType } from '../../types/ticket-link.type'
import { githubPrToPullRequestType } from '../../types/release.mappers'
import { DiffRefsQuery } from './diff-refs.query'

@QueryHandler(DiffRefsQuery)
export class DiffRefsHandler extends BaseQueryHandler<DiffRefsQuery, PullRequestType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly ticketSource: ITicketSource,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
  ) {
    super(db)
  }

  protected async handle(query: DiffRefsQuery, tx: TxClient): Promise<PullRequestType[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.PULL_REQUEST,
        __type: Subject.PULL_REQUEST,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.resolveAccessToken(query.userId, tx)

    const mergedPrs = await this.gitHubClient.compareMergedPullRequests(
      project.repo,
      query.baseRef,
      query.compareRef,
      accessToken,
    )

    const linearCredential = await this.resolveLinearCredential(project.linearEnabled, query.projectId, tx)

    return Promise.all(
      mergedPrs.map(async (pr) => {
        const tickets = linearCredential ? await this.enrichTickets(pr, linearCredential) : []
        return githubPrToPullRequestType(pr, tickets)
      }),
    )
  }

  private async resolveAccessToken(userId: string, tx: TxClient): Promise<string> {
    const connection = await this.githubConnectionRepository.findByUserId(userId, tx)
    if (!connection) {
      throw new AppException(
        'GitHub is not connected. Please connect your GitHub account in settings.',
        ErrorCode.GITHUB_NOT_CONNECTED,
      )
    }
    return decryptToken(connection.accessToken)
  }

  private async resolveLinearCredential(
    linearEnabled: boolean,
    projectId: string,
    tx: TxClient,
  ): Promise<string | null> {
    if (!linearEnabled) return null
    const connection = await this.linearConnectionRepository.findByProject(projectId, tx)
    if (!connection) return null
    return decryptToken(connection.accessToken)
  }

  private async enrichTickets(
    pr: IGitHubMergedPr,
    credential: string,
  ): Promise<TicketLinkType[]> {
    const commitMessages = pr.commits.map((c) => c.message)
    const detectedRefs = this.ticketSource.detectRefs({
      branchName: '',
      title: pr.title,
      body: pr.body,
      commitMessages,
    })

    const tickets: TicketLinkType[] = []
    for (const detected of detectedRefs) {
      const details = await this.ticketSource.confirmIssue(detected.issueId, credential)
      if (!details) continue

      const ticket = new TicketLinkType()
      ticket.issueId = details.issueId
      ticket.source = this.ticketSource.source
      ticket.url = details.url
      ticket.title = details.title
      ticket.confidence = resolveConfidence(detected.confidenceSource)
      tickets.push(ticket)
    }
    return tickets
  }
}
