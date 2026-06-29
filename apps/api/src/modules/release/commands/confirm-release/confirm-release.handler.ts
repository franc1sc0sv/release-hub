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
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { htmlToMarkdown } from '../../../../common/text/html-to-markdown'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { IFeatureRepository } from '../../../feature/interfaces/feature.repository'
import type { IConfirmReleasePreparation } from '../../interfaces/release.interfaces'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { ReleaseShippedEvent } from '../../events/release-shipped.event'
import { ConfirmReleaseCommand } from './confirm-release.command'

interface IConfirmReleaseSource {
  repo: string
  baseRef: string
  compareRef: string
  releaseName: string
  prBody: string
  accessToken: string
  suggestedFeatureIds: string[]
}

@CommandHandler(ConfirmReleaseCommand)
export class ConfirmReleaseHandler extends PreparedCommandHandler<
  ConfirmReleaseCommand,
  IConfirmReleasePreparation,
  ReleaseObjectType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: ConfirmReleaseCommand): Promise<IConfirmReleasePreparation> {
    const source = await this.resolveSource(command)

    const prTitle = `Release ${source.releaseName}`
    const openedPr = await this.gitHubClient.openReleasePullRequest(
      source.repo,
      source.baseRef,
      source.compareRef,
      prTitle,
      source.prBody,
      source.accessToken,
    )

    return {
      releaseName: source.releaseName,
      prUrl: openedPr.url,
      suggestedFeatureIds: source.suggestedFeatureIds,
    }
  }

  protected async handle(
    command: ConfirmReleaseCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: IConfirmReleasePreparation,
  ): Promise<ReleaseObjectType> {
    for (const featureId of prepared.suggestedFeatureIds) {
      await this.featureRepository.acceptSuggested(featureId, {}, tx)
    }

    const updated = await this.releaseRepository.updateStatus(
      command.releaseId,
      ReleaseStatus.PR_CREATED,
      prepared.prUrl,
      tx,
    )

    events.push(
      new ReleaseShippedEvent(updated.id, updated.projectId, prepared.prUrl, prepared.releaseName),
    )

    return toReleaseObjectType(updated)
  }

  private async resolveSource(command: ConfirmReleaseCommand): Promise<IConfirmReleaseSource> {
    return this.db.$transaction(async (tx) => {
      const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
      const ability = defineAbilityFor(memberships)

      const release = await this.releaseRepository.findById(command.releaseId, tx)
      if (!release) throw new NotFoundException('Release')

      if (
        !ability.can(Action.UPDATE, {
          kind: Subject.RELEASE,
          __type: Subject.RELEASE,
          projectId: release.projectId,
        })
      ) {
        throw new ForbiddenException()
      }

      if (release.status !== ReleaseStatus.DRAFT) {
        throw new AppException('Only draft releases can be confirmed', ErrorCode.VALIDATION_ERROR)
      }

      const prs = await this.pullRequestRepository.findAllByRelease(command.releaseId, tx)
      if (prs.length === 0) {
        throw new AppException('Release has no pull requests', ErrorCode.VALIDATION_ERROR)
      }

      const unassigned = prs.filter((pr) => pr.featureId === null)
      if (unassigned.length > 0) {
        throw new AppException(
          'All pull requests must be assigned to a feature before confirming',
          ErrorCode.VALIDATION_ERROR,
        )
      }

      const assignedFeatureIds = [...new Set(prs.map((pr) => pr.featureId as string))]
      const suggestedFeatures = await this.featureRepository.findSuggestedByIds(
        assignedFeatureIds,
        tx,
      )

      const project = await this.projectRepository.findById(release.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const accessToken = await this.resolveAccessToken(command.userId, tx)

      return {
        repo: project.repo,
        baseRef: release.baseRef,
        compareRef: release.compareRef,
        releaseName: release.name ?? release.compareRef,
        prBody: release.summary ? htmlToMarkdown(release.summary) : '',
        accessToken,
        suggestedFeatureIds: suggestedFeatures.map((f) => f.id),
      }
    })
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
}
