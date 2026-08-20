import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagHistoryEventType, FlagHistorySource } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException, AppException } from '../../../../common/errors'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithClient } from '../../interfaces/flagsmith-client.abstract'
import { IFlagsmithFlagRepository } from '../../interfaces/flagsmith-flag.repository'
import type { ISetFlagStateTarget } from '../../interfaces/flagsmith-sync.interfaces'
import { IFlagHistoryRepository } from '../../../flag-tracking/interfaces/flag-history.repository'
import type { ICreateFlagHistoryEventData } from '../../../flag-tracking/interfaces/flag-history.repository'
import { FlagWriteReportType, FlagWriteResultType } from '../../types/flag-write-report.type'
import { runInBatches } from '../../utils/run-in-batches'
import { SetFlagStatesCommand } from './set-flag-states.command'

interface IAppliedTarget {
  target: ISetFlagStateTarget
  ok: boolean
  error: string | null
}

interface IPreparedFlagStates {
  applied: IAppliedTarget[]
}

const WRITE_CONCURRENCY = 5

@CommandHandler(SetFlagStatesCommand)
export class SetFlagStatesHandler extends PreparedCommandHandler<
  SetFlagStatesCommand,
  IPreparedFlagStates,
  FlagWriteReportType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithClient: IFlagsmithClient,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: SetFlagStatesCommand): Promise<IPreparedFlagStates> {
    const { credentials, environmentApiKeyByName } = await this.db.$transaction(async (tx) => {
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

      const project = await this.projectRepository.findById(command.projectId, tx)
      if (!project) throw new NotFoundException('Project')
      if (!project.flagsmithEnabled) {
        throw new AppException('Flagsmith is not enabled for this project', ErrorCode.VALIDATION_ERROR)
      }

      const found = await this.projectRepository.findCredentials(command.projectId, tx)
      if (!found?.flagsmithUrl || !found.flagsmithApiKey) {
        throw new AppException('Flagsmith is not configured for this project', ErrorCode.VALIDATION_ERROR)
      }

      const environments = await this.flagsmithFlagRepository.findEnvironmentCredentials(command.projectId, tx)

      return {
        credentials: { flagsmithUrl: found.flagsmithUrl, flagsmithApiKey: found.flagsmithApiKey },
        environmentApiKeyByName: new Map(environments.map((env) => [env.name, env.flagsmithApiKey])),
      }
    })

    const applied = await runInBatches(command.targets, WRITE_CONCURRENCY, async (target) => {
      const environmentApiKey = environmentApiKeyByName.get(target.environmentName)
      if (!environmentApiKey) {
        return { target, ok: false, error: `Environment "${target.environmentName}" is unknown` }
      }

      const result = await this.flagsmithClient.setFeatureStateEnabled(
        credentials.flagsmithUrl,
        credentials.flagsmithApiKey,
        environmentApiKey,
        target.key,
        target.enabled,
      )

      return { target, ok: result.ok, error: result.ok ? null : result.error.message }
    })

    return { applied }
  }

  protected async handle(
    command: SetFlagStatesCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: IPreparedFlagStates,
  ): Promise<FlagWriteReportType> {
    const succeededTargets = prepared.applied.filter((entry) => entry.ok).map((entry) => entry.target)

    const updates = await this.flagsmithFlagRepository.setStatesEnabled(
      command.projectId,
      succeededTargets,
      tx,
    )

    const historyRows: ICreateFlagHistoryEventData[] = updates.map((update) => ({
      projectId: command.projectId,
      flagKey: update.key,
      flagsmithFlagId: update.flagId,
      type: update.newEnabled ? FlagHistoryEventType.flag_enabled : FlagHistoryEventType.flag_disabled,
      environmentName: update.environmentName,
      previousValue: String(update.previousEnabled),
      newValue: String(update.newEnabled),
      actorId: command.userId,
      source: FlagHistorySource.user,
    }))

    await this.flagHistoryRepository.createMany(historyRows, tx)

    const results = prepared.applied.map((entry) =>
      Object.assign(new FlagWriteResultType(), {
        flagKey: entry.target.key,
        environmentName: entry.target.environmentName,
        ok: entry.ok,
        error: entry.error,
      }),
    )

    return Object.assign(new FlagWriteReportType(), {
      succeeded: results.filter((result) => result.ok).length,
      failed: results.filter((result) => !result.ok).length,
      results,
    })
  }
}
