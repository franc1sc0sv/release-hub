import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import type { IProject } from '../../../project/interfaces/project.interfaces'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import type { IGitHubMergedPr } from '../../../integration/interfaces/github-client.interface'
import { ITicketSource } from '../../../integration/interfaces/ticket-source.abstract'
import { ITicketLinkRepository } from '../../../integration/interfaces/ticket-link.repository'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { ILinearConnectionRepository } from '../../../linear-auth/interfaces/linear-connection.repository'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { resolveConfidence } from '../../../integration/clients/ticket-confidence'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { ICommitRepository } from '../../interfaces/commit.repository'
import type {
  ICreateReleasePreparation,
  IPreparedPullRequest,
  IPreparedTicketLink,
} from '../../interfaces/release.interfaces'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { ReleaseCreatedEvent } from '../../events/release-created.event'
import { CreateReleaseCommand } from './create-release.command'

interface IResolvedReleaseSource {
  repo: string
  accessToken: string
  linearCredential: string | null
}

@CommandHandler(CreateReleaseCommand)
export class CreateReleaseHandler extends PreparedCommandHandler<
  CreateReleaseCommand,
  ICreateReleasePreparation,
  ReleaseObjectType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly commitRepository: ICommitRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly ticketSource: ITicketSource,
    private readonly ticketLinkRepository: ITicketLinkRepository,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: CreateReleaseCommand): Promise<ICreateReleasePreparation> {
    const { repo, accessToken, linearCredential } = await this.resolveSource(command)

    const comparison = await this.gitHubClient.compareRefs(
      repo,
      command.baseRef,
      command.compareRef,
      accessToken,
    )

    if (comparison.aheadBy === 0) {
      throw new AppException(
        'No commits ahead: the compare ref has no new commits relative to the base ref',
        ErrorCode.VALIDATION_ERROR,
      )
    }

    const mergedPrs = await this.gitHubClient.compareMergedPullRequests(
      repo,
      command.baseRef,
      command.compareRef,
      accessToken,
    )

    const pullRequests: IPreparedPullRequest[] = []
    for (const pr of mergedPrs) {
      pullRequests.push({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        author: pr.author,
        mergedAt: pr.mergedAt,
        commits: pr.commits,
        ticketLinks: await this.resolveTicketLinks(pr, linearCredential),
      })
    }

    return { pullRequests }
  }

  protected async handle(
    command: CreateReleaseCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: ICreateReleasePreparation,
  ): Promise<ReleaseObjectType> {
    const release = await this.releaseRepository.create(
      {
        projectId: command.projectId,
        name: command.compareRef,
        baseRef: command.baseRef,
        compareRef: command.compareRef,
        tags: command.tags,
        createdById: command.userId,
      },
      tx,
    )

    for (const pr of prepared.pullRequests) {
      const persistedPr = await this.pullRequestRepository.upsert(
        {
          number: pr.number,
          title: pr.title,
          body: pr.body,
          author: pr.author,
          mergedAt: pr.mergedAt,
          releaseId: release.id,
        },
        tx,
      )

      for (const commit of pr.commits) {
        await this.commitRepository.upsert(
          {
            pullRequestId: persistedPr.id,
            sha: commit.sha,
            message: commit.message,
            author: commit.author,
            committedAt: commit.committedAt,
          },
          tx,
        )
      }

      for (const ticket of pr.ticketLinks) {
        await this.ticketLinkRepository.upsertForPr(
          {
            pullRequestId: persistedPr.id,
            issueId: ticket.issueId,
            url: ticket.url,
            title: ticket.title,
            description: ticket.description,
            source: ticket.source,
            confidence: ticket.confidence,
          },
          tx,
        )
      }
    }

    events.push(new ReleaseCreatedEvent(release.id, release.projectId))

    return toReleaseObjectType(release)
  }

  private async resolveSource(command: CreateReleaseCommand): Promise<IResolvedReleaseSource> {
    return this.db.$transaction(async (tx) => {
      const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
      const ability = defineAbilityFor(memberships)

      if (
        !ability.can(Action.CREATE, {
          kind: Subject.RELEASE,
          __type: Subject.RELEASE,
          projectId: command.projectId,
        })
      ) {
        throw new ForbiddenException()
      }

      const project = await this.projectRepository.findById(command.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const accessToken = await this.resolveGitHubToken(command.userId, tx)
      const linearCredential = await this.resolveLinearCredential(project, command.projectId, tx)

      return { repo: project.repo, accessToken, linearCredential }
    })
  }

  private async resolveTicketLinks(
    pr: IGitHubMergedPr,
    linearCredential: string | null,
  ): Promise<IPreparedTicketLink[]> {
    if (!linearCredential) return []

    const detectedRefs = this.ticketSource.detectRefs({
      branchName: '',
      title: pr.title,
      body: pr.body,
      commitMessages: pr.commits.map((c) => c.message),
    })

    const links: IPreparedTicketLink[] = []
    for (const detected of detectedRefs) {
      const details = await this.ticketSource.confirmIssue(detected.issueId, linearCredential)
      if (!details) continue

      links.push({
        issueId: details.issueId,
        url: details.url,
        title: details.title,
        description: details.description,
        source: this.ticketSource.source,
        confidence: resolveConfidence(detected.confidenceSource),
      })
    }
    return links
  }

  private async resolveGitHubToken(userId: string, tx: TxClient): Promise<string> {
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
    project: IProject,
    projectId: string,
    tx: TxClient,
  ): Promise<string | null> {
    if (!project.linearEnabled) return null
    const connection = await this.linearConnectionRepository.findByProject(projectId, tx)
    if (!connection) return null
    return decryptToken(connection.accessToken)
  }
}
