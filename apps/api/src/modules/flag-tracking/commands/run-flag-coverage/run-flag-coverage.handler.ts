import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagAction, FlagReferenceKind, FlagHistoryEventType, FlagHistorySource } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IPullRequestRepository } from '../../../release/interfaces/pull-request.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IFlagBranchPresenceRepository } from '../../interfaces/flag-branch-presence.repository'
import { IPullRequestFlagChangeRepository } from '../../interfaces/pull-request-flag-change.repository'
import { IFlagRegistryParser } from '../../interfaces/flag-registry-parser.abstract'
import {
  IFlagHistoryRepository,
  FLAG_HISTORY_PROJECT_SCOPE_KEY,
} from '../../interfaces/flag-history.repository'
import type { ICreateFlagHistoryEventData } from '../../interfaces/flag-history.repository'
import type { IRunFlagCoveragePreparation } from '../../interfaces/flag-tracking.interfaces'
import { FlagCoverageSummaryType } from '../../types/flag-coverage-summary.type'
import { FlagCoverageRunEvent } from '../../events/flag-coverage-run.event'
import { RunFlagCoverageCommand } from './run-flag-coverage.command'

interface IResolvedFlagCoverageSource {
  repo: string
  flagRegistryPath: string
  accessToken: string
  pullRequests: { id: string; number: number; featureId: string | null }[]
}

@CommandHandler(RunFlagCoverageCommand)
export class RunFlagCoverageHandler extends PreparedCommandHandler<
  RunFlagCoverageCommand,
  IRunFlagCoveragePreparation,
  FlagCoverageSummaryType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
    private readonly flagRegistryParser: IFlagRegistryParser,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
    private readonly flagBranchPresenceRepository: IFlagBranchPresenceRepository,
    private readonly pullRequestFlagChangeRepository: IPullRequestFlagChangeRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: RunFlagCoverageCommand): Promise<IRunFlagCoveragePreparation> {
    const { repo, flagRegistryPath, accessToken, pullRequests } = await this.resolveSource(command)

    const branches = await this.gitHubClient.listBranches(repo, accessToken)
    const branchKeys: { branch: string; keys: string[] }[] = []
    const unionKeys = new Set<string>()

    for (const branch of branches) {
      const content = await this.gitHubClient.getFileContent(repo, branch.name, flagRegistryPath, accessToken)
      if (content === null) continue

      const keys = this.flagRegistryParser.parseRegistry(content)
      branchKeys.push({ branch: branch.name, keys: [...keys] })
      for (const key of keys) unionKeys.add(key)
    }

    const defaultBranch = await this.gitHubClient.getDefaultBranch(repo, accessToken)
    const defaultBranchEntry = branchKeys.find((entry) => entry.branch === defaultBranch)
    const defaultBranchKeys = defaultBranchEntry?.keys ?? []

    const prRegistryDiffs: IRunFlagCoveragePreparation['prRegistryDiffs'] = []
    for (const pr of pullRequests) {
      const files = await this.gitHubClient.listPullRequestFiles(repo, pr.number, accessToken)
      const registryFile = files.find((file) => file.filename === flagRegistryPath)
      if (!registryFile || registryFile.patch === null) continue

      const { added, removed } = this.flagRegistryParser.parsePatchDiff(registryFile.patch)
      if (added.size === 0 && removed.size === 0) continue

      prRegistryDiffs.push({
        pullRequestId: pr.id,
        prNumber: pr.number,
        featureId: pr.featureId,
        added: [...added],
        removed: [...removed],
      })
    }

    return {
      repo,
      flagRegistryPath,
      unionKeys: [...unionKeys],
      defaultBranchKeys,
      branchKeys,
      prRegistryDiffs,
    }
  }

  protected async handle(
    command: RunFlagCoverageCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: IRunFlagCoveragePreparation,
  ): Promise<FlagCoverageSummaryType> {
    const trackedFlagIdByKey = new Map<string, string>()
    const historyEvents: ICreateFlagHistoryEventData[] = []

    for (const key of prepared.unionKeys) {
      const trackedFlag = await this.trackedFlagRepository.upsertByProjectAndKey(
        {
          projectId: command.projectId,
          key,
          presentInCode: prepared.defaultBranchKeys.includes(key),
        },
        tx,
      )
      trackedFlagIdByKey.set(key, trackedFlag.id)
    }

    for (const { branch, keys } of prepared.branchKeys) {
      for (const key of keys) {
        const trackedFlagId = trackedFlagIdByKey.get(key)
        if (!trackedFlagId) continue
        const { isNew } = await this.flagBranchPresenceRepository.upsertPresence(
          { trackedFlagId, branch, present: true, headSha: null },
          tx,
        )
        if (isNew) {
          historyEvents.push({
            projectId: command.projectId,
            flagKey: key,
            trackedFlagId,
            type: FlagHistoryEventType.first_seen_branch,
            branchName: branch,
            source: FlagHistorySource.system,
          })
        }
      }
    }

    for (const [key, trackedFlagId] of trackedFlagIdByKey) {
      const presentBranches = prepared.branchKeys
        .filter((entry) => entry.keys.includes(key))
        .map((entry) => entry.branch)
      await this.flagBranchPresenceRepository.markAbsentForMissingBranches(trackedFlagId, presentBranches, tx)
    }

    for (const diff of prepared.prRegistryDiffs) {
      for (const key of diff.added) {
        const trackedFlagId = trackedFlagIdByKey.get(key)
        if (!trackedFlagId) continue

        const existing = await this.pullRequestFlagChangeRepository.findExisting(
          diff.pullRequestId,
          trackedFlagId,
          FlagAction.added,
          FlagReferenceKind.DEFINITION,
          tx,
        )
        if (!existing) {
          await this.pullRequestFlagChangeRepository.create(
            {
              pullRequestId: diff.pullRequestId,
              trackedFlagId,
              action: FlagAction.added,
              kind: FlagReferenceKind.DEFINITION,
              detectedFile: prepared.flagRegistryPath,
            },
            tx,
          )
          await this.trackedFlagRepository.setAddedInPullRequest(trackedFlagId, diff.pullRequestId, diff.featureId, tx)
          historyEvents.push({
            projectId: command.projectId,
            flagKey: key,
            trackedFlagId,
            type: FlagHistoryEventType.detected_definition,
            prNumber: diff.prNumber,
            detectedFile: prepared.flagRegistryPath,
            source: FlagHistorySource.system,
          })
        }
      }

      for (const key of diff.removed) {
        const trackedFlagId = trackedFlagIdByKey.get(key)
        if (!trackedFlagId) continue

        const existing = await this.pullRequestFlagChangeRepository.findExisting(
          diff.pullRequestId,
          trackedFlagId,
          FlagAction.removed,
          FlagReferenceKind.DEFINITION,
          tx,
        )
        if (!existing) {
          await this.pullRequestFlagChangeRepository.create(
            {
              pullRequestId: diff.pullRequestId,
              trackedFlagId,
              action: FlagAction.removed,
              kind: FlagReferenceKind.DEFINITION,
              detectedFile: prepared.flagRegistryPath,
            },
            tx,
          )
          await this.trackedFlagRepository.setRemovedInPullRequest(trackedFlagId, diff.pullRequestId, tx)
          historyEvents.push({
            projectId: command.projectId,
            flagKey: key,
            trackedFlagId,
            type: FlagHistoryEventType.detected_definition,
            prNumber: diff.prNumber,
            detectedFile: prepared.flagRegistryPath,
            source: FlagHistorySource.system,
          })
        }
      }
    }

    events.push(
      new FlagCoverageRunEvent(
        command.projectId,
        prepared.unionKeys.length,
        prepared.branchKeys.length,
        prepared.prRegistryDiffs.length,
      ),
    )

    const summary = new FlagCoverageSummaryType()
    summary.flagsTracked = prepared.unionKeys.length
    summary.branchesScanned = prepared.branchKeys.length
    summary.prChangesDetected = prepared.prRegistryDiffs.reduce(
      (total, diff) => total + diff.added.length + diff.removed.length,
      0,
    )

    await this.flagHistoryRepository.createMany(historyEvents, tx)

    await this.flagHistoryRepository.create(
      {
        projectId: command.projectId,
        flagKey: FLAG_HISTORY_PROJECT_SCOPE_KEY,
        type: FlagHistoryEventType.coverage_scan,
        newValue: `flagsTracked=${summary.flagsTracked};branchesScanned=${summary.branchesScanned};prChangesDetected=${summary.prChangesDetected}`,
        source: FlagHistorySource.system,
      },
      tx,
    )

    return summary
  }

  private async resolveSource(command: RunFlagCoverageCommand): Promise<IResolvedFlagCoverageSource> {
    return this.db.$transaction(async (tx) => {
      await authorizeProjectAction(
        this.organizationRepository,
        {
          actorId: command.userId,
          projectId: command.projectId,
          action: Action.UPDATE,
          subjectKind: Subject.PROJECT,
        },
        tx,
      )

      const config = await this.projectRepository.findFlagRegistryConfig(command.projectId, tx)
      if (!config) throw new NotFoundException('Project')

      if (!config.flagRegistryPath) {
        throw new AppException('Flag registry path is not configured for this project', ErrorCode.VALIDATION_ERROR)
      }

      const accessToken = await this.tokenResolver.resolveForProject(command.projectId, command.userId, tx)

      const releases = await this.releaseRepository.findAllByProject(command.projectId, tx)
      const pullRequests: { id: string; number: number; featureId: string | null }[] = []
      for (const release of releases) {
        const prs = await this.pullRequestRepository.findAllByRelease(release.id, tx)
        for (const pr of prs) {
          pullRequests.push({ id: pr.id, number: pr.number, featureId: pr.featureId })
        }
      }

      return {
        repo: config.repo,
        flagRegistryPath: config.flagRegistryPath,
        accessToken,
        pullRequests,
      }
    })
  }
}
