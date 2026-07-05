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
import type { IRelease } from '../../../release/interfaces/release.interfaces'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { IFlagBranchPresenceRepository } from '../../interfaces/flag-branch-presence.repository'
import { IPullRequestFlagChangeRepository } from '../../interfaces/pull-request-flag-change.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { IFlagHistoryRepository } from '../../interfaces/flag-history.repository'
import type { ICreateFlagHistoryEventData } from '../../interfaces/flag-history.repository'
import { IFlagRegistryParser } from '../../interfaces/flag-registry-parser.abstract'
import type { IPerFlagCoveragePreparation, IReleaseFlagDecision } from '../../interfaces/flag-tracking.interfaces'
import { TrackedFlagDetailType } from '../../types/tracked-flag-detail.type'
import { buildTrackedFlagDetailType } from '../../types/flag-tracking.mappers'
import { RunFlagCoverageForFlagCommand } from './run-flag-coverage-for-flag.command'

interface IResolvedPerFlagSource {
  projectId: string
  repo: string
  flagRegistryPath: string
  accessToken: string
  pullRequests: { id: string; number: number; featureId: string | null }[]
}

@CommandHandler(RunFlagCoverageForFlagCommand)
export class RunFlagCoverageForFlagHandler extends PreparedCommandHandler<
  RunFlagCoverageForFlagCommand,
  IPerFlagCoveragePreparation,
  TrackedFlagDetailType
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
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: RunFlagCoverageForFlagCommand): Promise<IPerFlagCoveragePreparation> {
    const source = await this.resolveSource(command)

    const branches = await this.gitHubClient.listBranches(source.repo, source.accessToken)
    const branchKeys: { branch: string; present: boolean }[] = []

    for (const branch of branches) {
      const content = await this.gitHubClient.getFileContent(
        source.repo,
        branch.name,
        source.flagRegistryPath,
        source.accessToken,
      )
      if (content === null) continue

      const keys = this.flagRegistryParser.parseRegistry(content)
      branchKeys.push({ branch: branch.name, present: keys.has(command.key) })
    }

    const defaultBranch = await this.gitHubClient.getDefaultBranch(source.repo, source.accessToken)
    const defaultBranchEntry = branchKeys.find((entry) => entry.branch === defaultBranch)
    const presentInDefaultBranch = defaultBranchEntry?.present ?? false

    const prChanges: IPerFlagCoveragePreparation['prChanges'] = []

    for (const pr of source.pullRequests) {
      const files = await this.gitHubClient.listPullRequestFiles(source.repo, pr.number, source.accessToken)

      for (const file of files) {
        if (file.patch === null) continue
        if (file.filename !== source.flagRegistryPath) continue

        const { added, removed } = this.flagRegistryParser.parsePatchDiff(file.patch)
        if (added.has(command.key)) {
          prChanges.push({
            pullRequestId: pr.id,
            prNumber: pr.number,
            featureId: pr.featureId,
            action: FlagAction.added,
            kind: FlagReferenceKind.DEFINITION,
            detectedFile: source.flagRegistryPath,
          })
        }
        if (removed.has(command.key)) {
          prChanges.push({
            pullRequestId: pr.id,
            prNumber: pr.number,
            featureId: pr.featureId,
            action: FlagAction.removed,
            kind: FlagReferenceKind.DEFINITION,
            detectedFile: source.flagRegistryPath,
          })
        }
      }
    }

    return {
      projectId: source.projectId,
      key: command.key,
      repo: source.repo,
      flagRegistryPath: source.flagRegistryPath,
      presentInDefaultBranch,
      branchKeys,
      prChanges,
    }
  }

  protected async handle(
    _command: RunFlagCoverageForFlagCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: IPerFlagCoveragePreparation,
  ): Promise<TrackedFlagDetailType> {
    const trackedFlag = await this.trackedFlagRepository.upsertByProjectAndKey(
      { projectId: prepared.projectId, key: prepared.key, presentInCode: prepared.presentInDefaultBranch },
      tx,
    )

    const historyEvents: ICreateFlagHistoryEventData[] = []

    for (const { branch, present } of prepared.branchKeys) {
      const { isNew } = await this.flagBranchPresenceRepository.upsertPresence(
        { trackedFlagId: trackedFlag.id, branch, present, headSha: null },
        tx,
      )
      if (isNew) {
        historyEvents.push({
          projectId: prepared.projectId,
          flagKey: prepared.key,
          trackedFlagId: trackedFlag.id,
          type: FlagHistoryEventType.first_seen_branch,
          branchName: branch,
          source: FlagHistorySource.system,
        })
      }
    }

    const presentBranches = prepared.branchKeys.filter((entry) => entry.present).map((entry) => entry.branch)
    await this.flagBranchPresenceRepository.markAbsentForMissingBranches(trackedFlag.id, presentBranches, tx)

    for (const change of prepared.prChanges) {
      const existing = await this.pullRequestFlagChangeRepository.findExisting(
        change.pullRequestId,
        trackedFlag.id,
        change.action,
        change.kind,
        tx,
      )
      if (existing) continue

      await this.pullRequestFlagChangeRepository.create(
        {
          pullRequestId: change.pullRequestId,
          trackedFlagId: trackedFlag.id,
          action: change.action,
          kind: change.kind,
          detectedFile: change.detectedFile,
        },
        tx,
      )

      historyEvents.push({
        projectId: prepared.projectId,
        flagKey: prepared.key,
        trackedFlagId: trackedFlag.id,
        type:
          change.kind === FlagReferenceKind.DEFINITION
            ? FlagHistoryEventType.detected_definition
            : FlagHistoryEventType.detected_usage,
        prNumber: change.prNumber,
        detectedFile: change.detectedFile,
        source: FlagHistorySource.system,
      })

      if (change.kind === FlagReferenceKind.DEFINITION) {
        if (change.action === FlagAction.added) {
          await this.trackedFlagRepository.setAddedInPullRequest(
            trackedFlag.id,
            change.pullRequestId,
            change.featureId,
            tx,
          )
        } else if (change.action === FlagAction.removed) {
          await this.trackedFlagRepository.setRemovedInPullRequest(trackedFlag.id, change.pullRequestId, tx)
        }
      }
    }

    await this.flagHistoryRepository.createMany(historyEvents, tx)

    const flag = await this.trackedFlagRepository.findByProjectAndKeyWithDetails(prepared.projectId, prepared.key, tx)
    if (!flag) throw new NotFoundException('TrackedFlag')

    const changes = await this.pullRequestFlagChangeRepository.findAllForTrackedFlag(flag.id, tx)

    const releases = await this.releaseRepository.findAllByProject(prepared.projectId, tx)
    const releasesByPullRequestId = new Map<string, IRelease>()
    for (const change of changes) {
      const release = releases.find((r) => r.id === change.pullRequest.releaseId)
      if (release) releasesByPullRequestId.set(change.pullRequestId, release)
    }

    const decisionsByReleaseId = new Map<string, IReleaseFlagDecision>()
    for (const release of releasesByPullRequestId.values()) {
      const decision = await this.releaseFlagDecisionRepository.findByReleaseAndFlag(release.id, flag.id, tx)
      if (decision) decisionsByReleaseId.set(release.id, decision)
    }

    return buildTrackedFlagDetailType(flag, changes, releasesByPullRequestId, decisionsByReleaseId)
  }

  private async resolveSource(command: RunFlagCoverageForFlagCommand): Promise<IResolvedPerFlagSource> {
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
        projectId: command.projectId,
        repo: config.repo,
        flagRegistryPath: config.flagRegistryPath,
        accessToken,
        pullRequests,
      }
    })
  }
}
