import { CommandHandler } from '@nestjs/cqrs'
import { Logger } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { htmlToMarkdown } from '../../../../common/text/html-to-markdown'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { IFeatureRepository } from '../../../feature/interfaces/feature.repository'
import { IFeatureInReleaseRepository } from '../../interfaces/feature-in-release.repository'
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
  assignedFeatureIds: string[]
}

@CommandHandler(ConfirmReleaseCommand)
export class ConfirmReleaseHandler extends PreparedCommandHandler<
  ConfirmReleaseCommand,
  IConfirmReleasePreparation,
  ReleaseObjectType
> {
  private readonly logger = new Logger(ConfirmReleaseHandler.name)

  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly featureInReleaseRepository: IFeatureInReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: ConfirmReleaseCommand): Promise<IConfirmReleasePreparation> {
    const source = await this.resolveSource(command)

    const prTitle = `Release ${source.releaseName}`
    let prUrl: string | null = null
    try {
      const openedPr = await this.gitHubClient.openReleasePullRequest(
        source.repo,
        source.baseRef,
        source.compareRef,
        prTitle,
        source.prBody,
        source.accessToken,
      )
      prUrl = openedPr.url
    } catch (error) {
      this.logger.warn(
        `Skipping pull request for release ${command.releaseId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      )
    }

    return {
      releaseName: source.releaseName,
      prUrl,
      suggestedFeatureIds: source.suggestedFeatureIds,
      assignedFeatureIds: source.assignedFeatureIds,
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

    for (const featureId of prepared.assignedFeatureIds) {
      const feature = await this.featureRepository.findById(featureId, tx)
      if (!feature) continue
      await this.featureInReleaseRepository.upsertState(
        featureId,
        command.releaseId,
        feature.state,
        tx,
      )
    }

    const updated = await this.releaseRepository.updateStatus(
      command.releaseId,
      ReleaseStatus.READY_TO_RELEASE,
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

      const accessToken = await this.tokenResolver.resolveForProject(release.projectId, command.userId, tx)

      return {
        repo: project.repo,
        baseRef: release.baseRef,
        compareRef: release.compareRef,
        releaseName: release.name ?? release.compareRef,
        prBody: release.summary ? htmlToMarkdown(release.summary) : '',
        accessToken,
        suggestedFeatureIds: suggestedFeatures.map((f) => f.id),
        assignedFeatureIds,
      }
    })
  }
}
