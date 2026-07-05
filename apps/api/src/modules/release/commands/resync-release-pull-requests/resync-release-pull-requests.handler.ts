import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { AiDraftStatus } from '../../../../common/types/ai-draft-status.enum'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import type { IProject } from '../../../project/interfaces/project.interfaces'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import type { IGitHubMergedPr } from '../../../integration/interfaces/github-client.interface'
import { ITicketSource } from '../../../integration/interfaces/ticket-source.abstract'
import { ITicketLinkRepository } from '../../../integration/interfaces/ticket-link.repository'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { ILinearConnectionRepository } from '../../../linear-auth/interfaces/linear-connection.repository'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { resolveConfidence } from '../../../integration/clients/ticket-confidence'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { ICommitRepository } from '../../interfaces/commit.repository'
import type {
  IResyncReleasePreparation,
  IPreparedPullRequest,
  IPreparedTicketLink,
} from '../../interfaces/release.interfaces'
import { ResyncReleaseSummaryType } from '../../types/resync-release-summary.type'
import { ReleaseResyncedEvent } from '../../events/release-resynced.event'
import { ResyncReleasePullRequestsCommand } from './resync-release-pull-requests.command'

interface IResolvedResyncSource {
  releaseId: string
  projectId: string
  repo: string
  baseRef: string
  compareRef: string
  accessToken: string
  linearCredential: string | null
  existingNumbers: Set<number>
}

@CommandHandler(ResyncReleasePullRequestsCommand)
export class ResyncReleasePullRequestsHandler extends PreparedCommandHandler<
  ResyncReleasePullRequestsCommand,
  IResyncReleasePreparation,
  ResyncReleaseSummaryType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly commitRepository: ICommitRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly ticketSource: ITicketSource,
    private readonly ticketLinkRepository: ITicketLinkRepository,
    private readonly tokenResolver: IGithubTokenResolver,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(
    command: ResyncReleasePullRequestsCommand,
  ): Promise<IResyncReleasePreparation> {
    const source = await this.resolveSource(command)

    const mergedPrs = await this.gitHubClient.compareMergedPullRequests(
      source.repo,
      source.baseRef,
      source.compareRef,
      source.accessToken,
    )

    const newPrs = mergedPrs.filter((pr) => !source.existingNumbers.has(pr.number))

    const newPullRequests: IPreparedPullRequest[] = []
    for (const pr of newPrs) {
      newPullRequests.push({
        number: pr.number,
        title: pr.title,
        body: pr.body,
        author: pr.author,
        mergedAt: pr.mergedAt,
        commits: pr.commits,
        ticketLinks: await this.resolveTicketLinks(pr, source.linearCredential),
      })
    }

    return { projectId: source.projectId, newPullRequests }
  }

  protected async handle(
    command: ResyncReleasePullRequestsCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: IResyncReleasePreparation,
  ): Promise<ResyncReleaseSummaryType> {
    for (const pr of prepared.newPullRequests) {
      const persistedPr = await this.pullRequestRepository.upsert(
        {
          number: pr.number,
          title: pr.title,
          body: pr.body,
          author: pr.author,
          mergedAt: pr.mergedAt,
          releaseId: command.releaseId,
          pendingAddition: true,
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

    if (prepared.newPullRequests.length > 0) {
      await this.releaseRepository.updateAiDraftStatus(command.releaseId, AiDraftStatus.PENDING, tx)

      events.push(
        new ReleaseResyncedEvent(
          command.releaseId,
          prepared.projectId,
          prepared.newPullRequests.length,
        ),
      )
    }

    const summary = new ResyncReleaseSummaryType()
    summary.newPrsAdded = prepared.newPullRequests.length
    return summary
  }

  private async resolveSource(
    command: ResyncReleasePullRequestsCommand,
  ): Promise<IResolvedResyncSource> {
    return this.db.$transaction(async (tx) => {
      const release = await this.releaseRepository.findById(command.releaseId, tx)
      if (!release) throw new NotFoundException('Release')

      await authorizeProjectAction(
        this.organizationRepository,
        {
          actorId: command.userId,
          projectId: release.projectId,
          action: Action.UPDATE,
          subjectKind: Subject.RELEASE,
        },
        tx,
      )

      if (
        release.status === ReleaseStatus.MERGED ||
        release.status === ReleaseStatus.DEPLOYED ||
        release.status === ReleaseStatus.CANCELED
      ) {
        throw new AppException(
          'Pull requests cannot be resynced once a release is merged, deployed, or canceled',
          ErrorCode.VALIDATION_ERROR,
        )
      }

      const project = await this.projectRepository.findById(release.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const existingPrs = await this.pullRequestRepository.findAllByRelease(command.releaseId, tx)
      const existingNumbers = new Set(existingPrs.map((pr) => pr.number))

      const accessToken = await this.tokenResolver.resolveForProject(release.projectId, command.userId, tx)
      const linearCredential = await this.resolveLinearCredential(project, release.projectId, tx)

      return {
        releaseId: release.id,
        projectId: release.projectId,
        repo: project.repo,
        baseRef: release.baseRef,
        compareRef: release.compareRef,
        accessToken,
        linearCredential,
        existingNumbers,
      }
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
