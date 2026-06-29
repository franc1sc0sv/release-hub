import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IFlagsmithClient } from '../../../integration/interfaces/flagsmith-client.abstract'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { ReleaseShippedEvent } from '../../events/release-shipped.event'
import { ShipReleaseCommand } from './ship-release.command'

@CommandHandler(ShipReleaseCommand)
export class ShipReleaseHandler extends BaseCommandHandler<ShipReleaseCommand, ReleaseObjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly flagsmithClient: IFlagsmithClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: ShipReleaseCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ReleaseObjectType> {
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
      throw new AppException('Release has already been shipped', ErrorCode.VALIDATION_ERROR)
    }

    if (!release.summary) {
      throw new AppException('Release summary must be saved before shipping', ErrorCode.VALIDATION_ERROR)
    }

    const project = await this.projectRepository.findById(release.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.resolveAccessToken(command.userId, tx)

    const prs = await this.pullRequestRepository.findAllByRelease(command.releaseId, tx)
    const total = prs.length
    const assigned = prs.filter((pr) => pr.featureId !== null).length

    if (total === 0 || assigned < total) {
      throw new AppException(
        'All pull requests must be assigned to a feature before shipping',
        ErrorCode.VALIDATION_ERROR,
      )
    }

    if (project.flagsmithEnabled) {
      const credentials = await this.projectRepository.findCredentials(release.projectId, tx)
      if (credentials?.flagsmithUrl && credentials.flagsmithApiKey && credentials.flagsmithProjectId) {
        const result = await this.flagsmithClient.fetchFlags(
          credentials.flagsmithUrl,
          credentials.flagsmithApiKey,
          credentials.flagsmithProjectId,
        )
        if (result.ok) {
          const stagingMap = new Map(result.data.staging.map((f) => [f.key, f.enabled]))
          const hasDangerousParity = result.data.production.some(
            (f) => f.enabled && stagingMap.get(f.key) === false,
          )
          if (hasDangerousParity) {
            throw new AppException(
              'Flag parity check failed: one or more flags are enabled in production but disabled in staging',
              ErrorCode.VALIDATION_ERROR,
            )
          }
        }
      }
    }

    const sha = await this.gitHubClient.getRefSha(project.repo, release.compareRef, accessToken)

    const releaseName = release.name ?? release.compareRef
    const prTitle = `Release ${releaseName}`
    const prBody = release.summary ?? ''

    const [openedPr, createdTag] = await Promise.all([
      this.gitHubClient.openReleasePullRequest(
        project.repo,
        release.baseRef,
        release.compareRef,
        prTitle,
        prBody,
        accessToken,
      ),
      this.gitHubClient.createReleaseTag(project.repo, releaseName, sha, accessToken),
    ])

    const updated = await this.releaseRepository.updateStatus(
      command.releaseId,
      ReleaseStatus.PR_CREATED,
      openedPr.url,
      tx,
    )

    events.push(
      new ReleaseShippedEvent(updated.id, updated.projectId, openedPr.url, createdTag.tag),
    )

    return toReleaseObjectType(updated)
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
