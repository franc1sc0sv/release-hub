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
import { IFlagHistoryRepository } from '../../../flag-tracking/interfaces/flag-history.repository'
import type { ICreateFlagHistoryEventData } from '../../../flag-tracking/interfaces/flag-history.repository'
import { FlagWriteReportType, FlagWriteResultType } from '../../types/flag-write-report.type'
import { runInBatches } from '../../utils/run-in-batches'
import { DeleteFlagsCommand } from './delete-flags.command'

interface IDeletedFlag {
  flagKey: string
  ok: boolean
  error: string | null
}

interface IPreparedDeletion {
  deleted: IDeletedFlag[]
}

const WRITE_CONCURRENCY = 5

@CommandHandler(DeleteFlagsCommand)
export class DeleteFlagsHandler extends PreparedCommandHandler<
  DeleteFlagsCommand,
  IPreparedDeletion,
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

  protected async prepare(command: DeleteFlagsCommand): Promise<IPreparedDeletion> {
    const credentials = await this.db.$transaction(async (tx) => {
      await authorizeProjectAction(
        this.organizationRepository,
        {
          actorId: command.userId,
          projectId: command.projectId,
          action: Action.MANAGE,
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
      if (!found?.flagsmithUrl || !found.flagsmithApiKey || !found.flagsmithProjectId) {
        throw new AppException('Flagsmith is not configured for this project', ErrorCode.VALIDATION_ERROR)
      }

      return {
        flagsmithUrl: found.flagsmithUrl,
        flagsmithApiKey: found.flagsmithApiKey,
        flagsmithProjectId: found.flagsmithProjectId,
      }
    })

    const deleted = await runInBatches(command.flagKeys, WRITE_CONCURRENCY, async (flagKey) => {
      const result = await this.flagsmithClient.deleteFeature(
        credentials.flagsmithUrl,
        credentials.flagsmithApiKey,
        credentials.flagsmithProjectId,
        flagKey,
      )

      return { flagKey, ok: result.ok, error: result.ok ? null : result.error.message }
    })

    return { deleted }
  }

  protected async handle(
    command: DeleteFlagsCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: IPreparedDeletion,
  ): Promise<FlagWriteReportType> {
    const succeededKeys = prepared.deleted.filter((entry) => entry.ok).map((entry) => entry.flagKey)
    const removed = await this.flagsmithFlagRepository.softDeleteFlagsByKeys(
      command.projectId,
      succeededKeys,
      tx,
    )

    const historyRows: ICreateFlagHistoryEventData[] = removed.map((row) => ({
      projectId: command.projectId,
      flagKey: row.key,
      flagsmithFlagId: row.flagId,
      type: FlagHistoryEventType.flag_deleted,
      actorId: command.userId,
      source: FlagHistorySource.user,
    }))

    await this.flagHistoryRepository.createMany(historyRows, tx)

    const results = prepared.deleted.map((entry) =>
      Object.assign(new FlagWriteResultType(), {
        flagKey: entry.flagKey,
        environmentName: null,
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
