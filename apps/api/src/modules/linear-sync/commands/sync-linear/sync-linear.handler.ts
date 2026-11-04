import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs/prepared-command.handler'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { NotFoundException } from '../../../../common/errors'
import { ILogger } from '../../../../common/logging/logging.abstract'
import { LogEvent } from '../../../../common/logging/log-event.enum'
import { LinearSyncActionKind } from '../../../../common/types/linear-sync-action-kind.enum'
import { LinearSyncActionStatus } from '../../../../common/types/linear-sync-action-status.enum'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { ILinearConnectionRepository } from '../../../linear-auth/interfaces/linear-connection.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { ILinearIssueClient } from '../../interfaces/linear-issue-client.abstract'
import { ILinearSyncActionRepository } from '../../interfaces/linear-sync-action.repository'
import { ILinearSyncSourceRepository } from '../../interfaces/linear-sync-source.repository'
import {
  LabelChange,
  StatusMoveOutcome,
  type ILinearIssueSnapshot,
  type ILinearSyncAction,
  type ILinearWorkflowState,
  type IOpenPullRequestHead,
  type ISyncFlag,
  type ISyncRelease,
  type ISyncRun,
  type ISyncSources,
  type IUpsertLinearSyncActionData,
} from '../../interfaces/linear-sync.interfaces'
import {
  LINEAR_FLAG_OFF_LABEL_NAME,
  LINEAR_PRODUCTION_STATE_NAME,
  LINEAR_WRITE_SCOPE,
} from '../../linear-sync.constants'
import {
  ARCHIVED_DETAIL,
  decideStatusMove,
  extractTicketKeys,
  findOpenPullRequestForTicket,
  flagDedupeKey,
  planFlagLabel,
  resolveFlagSignal,
  statusDedupeKey,
} from '../../utils/plan-linear-sync'
import { SyncLinearCommand } from './sync-linear.command'

const STATUS_DONE_OUTCOMES: ReadonlySet<StatusMoveOutcome> = new Set([
  StatusMoveOutcome.MOVE,
  StatusMoveOutcome.ALREADY_THERE,
])

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

@CommandHandler(SyncLinearCommand)
export class SyncLinearHandler extends PreparedCommandHandler<SyncLinearCommand, IUpsertLinearSyncActionData[]> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly logger: ILogger,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
    private readonly sourceRepository: ILinearSyncSourceRepository,
    private readonly actionRepository: ILinearSyncActionRepository,
    private readonly linearClient: ILinearIssueClient,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubTokenResolver: IGithubTokenResolver,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: SyncLinearCommand): Promise<IUpsertLinearSyncActionData[]> {
    const sources = await this.db.$query((tx) => this.loadSources(command, tx))
    if (!sources) return []

    const teamKeys = await this.linearClient.listTeamKeys(sources.token)
    const dedupeKeys = this.dedupeKeys(sources.release, sources.flags, teamKeys)
    const existingActions = await this.db.$query((tx) =>
      this.loadExistingActions(command.projectId, dedupeKeys, tx),
    )

    const run: ISyncRun = {
      projectId: command.projectId,
      releaseId: sources.release?.id ?? null,
      token: sources.token,
      teamKeys,
      openHeads: sources.release ? await this.loadOpenHeads(command, sources.project.repo) : null,
      issues: new Map(),
      productionStates: new Map(),
      labelIds: new Map(),
      records: [],
    }

    if (sources.release) {
      await this.syncStatuses(run, sources.release, existingActions)
    }
    for (const flag of sources.flags) {
      await this.syncFlag(run, flag, existingActions)
    }
    return run.records
  }

  protected async handle(
    _command: SyncLinearCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    records: IUpsertLinearSyncActionData[],
  ): Promise<void> {
    for (const record of records) {
      await this.actionRepository.upsert(record, tx)
    }
  }

  private async loadSources(command: SyncLinearCommand, tx: TxClient): Promise<ISyncSources | null> {
    if (command.actorId) {
      await authorizeProjectAction(
        this.organizationRepository,
        { actorId: command.actorId, projectId: command.projectId, action: Action.UPDATE, subjectKind: Subject.RELEASE },
        tx,
      )
    }

    const project = await this.sourceRepository.findProject(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const connection = await this.linearConnectionRepository.findByProject(command.projectId, tx)
    const canWrite = connection?.scopes?.split(/[\s,]+/).includes(LINEAR_WRITE_SCOPE) ?? false
    if (!project.linearEnabled || !connection || !canWrite) {
      if (command.actorId) {
        throw new AppException(
          'Connect Linear with write access in Settings before you sync tickets.',
          ErrorCode.INTEGRATION_ERROR,
        )
      }
      return null
    }

    const found = command.releaseId ? await this.sourceRepository.findDeployedRelease(command.releaseId, tx) : null
    const release = found?.projectId === command.projectId ? found : null
    if (command.releaseId && !release) {
      if (command.actorId) {
        throw new AppException('Only a deployed release can be synced to Linear.', ErrorCode.CONFLICT)
      }
      return null
    }

    const flags = release
      ? await this.sourceRepository.findFlagsForRelease(release.id, tx)
      : command.flagKey
        ? [await this.sourceRepository.findFlagByKey(command.projectId, command.flagKey, tx)].filter(
            (flag): flag is ISyncFlag => flag !== null,
          )
        : []

    return { project, token: decryptToken(connection.accessToken), release, flags }
  }

  private async loadExistingActions(
    projectId: string,
    dedupeKeys: string[],
    tx: TxClient,
  ): Promise<Map<string, ILinearSyncAction>> {
    const existingActions = new Map<string, ILinearSyncAction>()
    for (const key of dedupeKeys) {
      const action = await this.actionRepository.findByDedupeKey(projectId, key, tx)
      if (action) existingActions.set(key, action)
    }
    return existingActions
  }

  private dedupeKeys(release: ISyncRelease | null, flags: ISyncFlag[], teamKeys: ReadonlySet<string>): string[] {
    const statusKeys = release
      ? extractTicketKeys(release.pullRequests.flatMap((pr) => pr.commitMessages), teamKeys).map((ticket) =>
          statusDedupeKey(release.id, ticket),
        )
      : []
    const flagKeys = flags.flatMap((flag) =>
      extractTicketKeys(flag.pullRequests.flatMap((pr) => pr.commitMessages), teamKeys).map((ticket) =>
        flagDedupeKey(flag.id, ticket),
      ),
    )
    return [...statusKeys, ...flagKeys]
  }

  private async loadOpenHeads(command: SyncLinearCommand, repo: string): Promise<IOpenPullRequestHead[] | null> {
    try {
      const token = await this.db.$query((tx) =>
        this.githubTokenResolver.resolveForProject(command.projectId, command.actorId, tx),
      )
      return await this.gitHubClient.listOpenPullRequestHeads(repo, token)
    } catch (error) {
      this.logError(command.projectId, error)
      return null
    }
  }

  private async syncStatuses(
    run: ISyncRun,
    release: ISyncRelease,
    existingActions: Map<string, ILinearSyncAction>,
  ): Promise<void> {
    const releasePullRequestNumbers = new Set(release.pullRequests.map((pr) => pr.number))
    const tickets = extractTicketKeys(release.pullRequests.flatMap((pr) => pr.commitMessages), run.teamKeys)

    for (const ticket of tickets) {
      const dedupeKey = statusDedupeKey(release.id, ticket)
      if (existingActions.get(dedupeKey)?.status === LinearSyncActionStatus.DONE) continue

      const base = {
        projectId: run.projectId,
        releaseId: release.id,
        trackedFlagId: null,
        issueIdentifier: ticket,
        kind: LinearSyncActionKind.MOVE_TO_PRODUCTION,
        dedupeKey,
        signature: null,
      }

      if (run.openHeads === null) {
        run.records.push({ ...base, status: LinearSyncActionStatus.FAILED, detail: 'Could not read open PRs from GitHub' })
        continue
      }

      try {
        const issue = await this.findIssue(run, ticket)
        const decision = decideStatusMove({
          issue,
          targetStateName: LINEAR_PRODUCTION_STATE_NAME,
          openPullRequestNumber: findOpenPullRequestForTicket(ticket, run.openHeads, releasePullRequestNumbers),
        })

        if (issue && decision.outcome === StatusMoveOutcome.MOVE) {
          const state = await this.findProductionState(run, issue.teamId)
          if (!state) {
            run.records.push({
              ...base,
              status: LinearSyncActionStatus.FAILED,
              detail: `Status ${LINEAR_PRODUCTION_STATE_NAME} not found in the Linear team`,
            })
            continue
          }
          await this.linearClient.setState(issue.id, state.id, run.token)
        }

        run.records.push({
          ...base,
          status: STATUS_DONE_OUTCOMES.has(decision.outcome) ? LinearSyncActionStatus.DONE : LinearSyncActionStatus.SKIPPED,
          detail: decision.detail,
        })
      } catch (error) {
        run.records.push({ ...base, status: LinearSyncActionStatus.FAILED, detail: errorMessage(error) })
      }
    }
  }

  private async syncFlag(
    run: ISyncRun,
    flag: ISyncFlag,
    existingActions: Map<string, ILinearSyncAction>,
  ): Promise<void> {
    const plan = planFlagLabel(resolveFlagSignal(flag), flag.key)
    if (!plan) return

    const tickets = extractTicketKeys(flag.pullRequests.flatMap((pr) => pr.commitMessages), run.teamKeys)

    for (const ticket of tickets) {
      const dedupeKey = flagDedupeKey(flag.id, ticket)
      const existing = existingActions.get(dedupeKey)
      if (existing?.status === LinearSyncActionStatus.DONE && existing.signature === plan.signature) continue

      const base = {
        projectId: run.projectId,
        releaseId: run.releaseId,
        trackedFlagId: flag.id,
        issueIdentifier: ticket,
        kind: LinearSyncActionKind.FLAG_LABEL,
        dedupeKey,
      }

      try {
        const issue = await this.findIssue(run, ticket)
        if (!issue) {
          run.records.push({
            ...base,
            signature: null,
            status: LinearSyncActionStatus.SKIPPED,
            detail: 'Ticket not found in Linear',
          })
          continue
        }
        if (issue.archived) {
          run.records.push({ ...base, signature: null, status: LinearSyncActionStatus.SKIPPED, detail: ARCHIVED_DETAIL })
          continue
        }

        const labelId = await this.findFlagLabel(run, issue.teamId)
        const hasLabel = issue.labelIds.includes(labelId)
        if ((plan.labelChange === LabelChange.ADD) !== hasLabel) {
          await this.linearClient.changeLabel(issue.id, labelId, plan.labelChange, run.token)
        }
        await this.linearClient.comment(issue.id, plan.comment, run.token)

        run.records.push({ ...base, signature: plan.signature, status: LinearSyncActionStatus.DONE, detail: plan.comment })
      } catch (error) {
        run.records.push({ ...base, signature: null, status: LinearSyncActionStatus.FAILED, detail: errorMessage(error) })
      }
    }
  }

  private async findIssue(run: ISyncRun, ticket: string): Promise<ILinearIssueSnapshot | null> {
    if (!run.issues.has(ticket)) {
      run.issues.set(ticket, await this.linearClient.findIssue(ticket, run.token))
    }
    return run.issues.get(ticket) ?? null
  }

  private async findProductionState(run: ISyncRun, teamId: string): Promise<ILinearWorkflowState | null> {
    if (!run.productionStates.has(teamId)) {
      run.productionStates.set(
        teamId,
        await this.linearClient.findWorkflowState(teamId, LINEAR_PRODUCTION_STATE_NAME, run.token),
      )
    }
    return run.productionStates.get(teamId) ?? null
  }

  private async findFlagLabel(run: ISyncRun, teamId: string): Promise<string> {
    const cached = run.labelIds.get(teamId)
    if (cached) return cached
    const labelId = await this.linearClient.ensureLabel(teamId, LINEAR_FLAG_OFF_LABEL_NAME, run.token)
    run.labelIds.set(teamId, labelId)
    return labelId
  }

  private logError(projectId: string, error: unknown): void {
    this.logger.error(
      { event: LogEvent.OPERATION_ERROR, projectId, err: errorMessage(error) },
      LogEvent.OPERATION_ERROR,
    )
  }
}
