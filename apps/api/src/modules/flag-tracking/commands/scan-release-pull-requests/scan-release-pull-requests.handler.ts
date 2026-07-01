import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagAction, FlagReferenceKind } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IPullRequestRepository } from '../../../release/interfaces/pull-request.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IPullRequestFlagChangeRepository } from '../../interfaces/pull-request-flag-change.repository'
import { IFlagRegistryParser } from '../../interfaces/flag-registry-parser.abstract'
import type { IScanReleasePullRequestsPreparation } from '../../interfaces/flag-tracking.interfaces'
import { ScanReleasePullRequestsSummaryType } from '../../types/scan-release-pull-requests-summary.type'
import { ReleasePullRequestsScannedEvent } from '../../events/release-pull-requests-scanned.event'
import { ScanReleasePullRequestsCommand } from './scan-release-pull-requests.command'

interface IResolvedScanSource {
  projectId: string
  repo: string
  flagRegistryPath: string
  accessToken: string
  pullRequests: { id: string; number: number; featureId: string | null }[]
}

@CommandHandler(ScanReleasePullRequestsCommand)
export class ScanReleasePullRequestsHandler extends PreparedCommandHandler<
  ScanReleasePullRequestsCommand,
  IScanReleasePullRequestsPreparation,
  ScanReleasePullRequestsSummaryType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly flagRegistryParser: IFlagRegistryParser,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly pullRequestFlagChangeRepository: IPullRequestFlagChangeRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: ScanReleasePullRequestsCommand): Promise<IScanReleasePullRequestsPreparation> {
    const source = await this.resolveSource(command)

    const detectedChanges: IScanReleasePullRequestsPreparation['detectedChanges'] = []

    for (const pr of source.pullRequests) {
      const files = await this.gitHubClient.listPullRequestFiles(source.repo, pr.number, source.accessToken)

      for (const file of files) {
        if (file.patch === null) continue
        if (file.filename !== source.flagRegistryPath) continue

        const { added, removed } = this.flagRegistryParser.parsePatchDiff(file.patch)
        for (const key of added) {
          detectedChanges.push({
            pullRequestId: pr.id,
            key,
            action: FlagAction.added,
            kind: FlagReferenceKind.DEFINITION,
            detectedFile: source.flagRegistryPath,
            featureId: pr.featureId,
          })
        }
        for (const key of removed) {
          detectedChanges.push({
            pullRequestId: pr.id,
            key,
            action: FlagAction.removed,
            kind: FlagReferenceKind.DEFINITION,
            detectedFile: source.flagRegistryPath,
            featureId: pr.featureId,
          })
        }
      }
    }

    return {
      projectId: source.projectId,
      pullRequestIds: source.pullRequests.map((pr) => pr.id),
      detectedChanges,
      prsScanned: source.pullRequests.length,
    }
  }

  protected async handle(
    _command: ScanReleasePullRequestsCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: IScanReleasePullRequestsPreparation,
  ): Promise<ScanReleasePullRequestsSummaryType> {
    await this.pullRequestFlagChangeRepository.deleteForPullRequestIds(prepared.pullRequestIds, tx)

    const trackedFlagIdByKey = new Map<string, string>()
    let changesRecorded = 0

    for (const change of prepared.detectedChanges) {
      let trackedFlagId = trackedFlagIdByKey.get(change.key)
      if (!trackedFlagId) {
        const existingFlag = await this.trackedFlagRepository.findByProjectAndKey(prepared.projectId, change.key, tx)
        const trackedFlag =
          existingFlag ??
          (await this.trackedFlagRepository.upsertByProjectAndKey(
            { projectId: prepared.projectId, key: change.key, presentInCode: true },
            tx,
          ))
        trackedFlagId = trackedFlag.id
        trackedFlagIdByKey.set(change.key, trackedFlagId)
      }

      await this.pullRequestFlagChangeRepository.create(
        {
          pullRequestId: change.pullRequestId,
          trackedFlagId,
          action: change.action,
          kind: change.kind,
          detectedFile: change.detectedFile,
        },
        tx,
      )
      changesRecorded += 1

      if (change.kind === FlagReferenceKind.DEFINITION) {
        if (change.action === FlagAction.added) {
          await this.trackedFlagRepository.setAddedInPullRequest(
            trackedFlagId,
            change.pullRequestId,
            change.featureId,
            tx,
          )
        } else if (change.action === FlagAction.removed) {
          await this.trackedFlagRepository.setRemovedInPullRequest(trackedFlagId, change.pullRequestId, tx)
        }
      }
    }

    events.push(
      new ReleasePullRequestsScannedEvent(
        _command.releaseId,
        prepared.projectId,
        prepared.prsScanned,
        changesRecorded,
      ),
    )

    const summary = new ScanReleasePullRequestsSummaryType()
    summary.prsScanned = prepared.prsScanned
    summary.flagsFound = trackedFlagIdByKey.size
    summary.changesRecorded = changesRecorded
    return summary
  }

  private async resolveSource(command: ScanReleasePullRequestsCommand): Promise<IResolvedScanSource> {
    return this.db.$transaction(async (tx) => {
      const release = await this.releaseRepository.findById(command.releaseId, tx)
      if (!release) throw new NotFoundException('Release')

      const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
      const ability = defineAbilityFor(memberships)

      if (
        !ability.can(Action.UPDATE, {
          kind: Subject.RELEASE,
          __type: Subject.RELEASE,
          projectId: release.projectId,
        })
      ) {
        throw new ForbiddenException()
      }

      const config = await this.projectRepository.findFlagRegistryConfig(release.projectId, tx)
      if (!config) throw new NotFoundException('Project')

      if (!config.flagRegistryPath) {
        throw new AppException('Flag registry path is not configured for this project', ErrorCode.VALIDATION_ERROR)
      }

      const accessToken = await this.resolveGitHubToken(command.userId, tx)

      const prs = await this.pullRequestRepository.findAllByRelease(command.releaseId, tx)

      return {
        projectId: release.projectId,
        repo: config.repo,
        flagRegistryPath: config.flagRegistryPath,
        accessToken,
        pullRequests: prs.map((pr) => ({ id: pr.id, number: pr.number, featureId: pr.featureId })),
      }
    })
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
}
