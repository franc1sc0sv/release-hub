import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException, AppException } from '../../../../common/errors'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithClient } from '../../interfaces/flagsmith-client.abstract'
import { IFlagsmithFlagRepository } from '../../interfaces/flagsmith-flag.repository'
import type { IAllEnvironmentFlagsData } from '../../interfaces/integration.interfaces'
import { SyncFlagsmithFlagsCommand } from './sync-flagsmith-flags.command'

interface IPreparedSync {
  data: IAllEnvironmentFlagsData | null
  error: string | null
}

@CommandHandler(SyncFlagsmithFlagsCommand)
export class SyncFlagsmithFlagsHandler extends PreparedCommandHandler<
  SyncFlagsmithFlagsCommand,
  IPreparedSync,
  number
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithClient: IFlagsmithClient,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: SyncFlagsmithFlagsCommand): Promise<IPreparedSync> {
    const credentials = await this.db.$transaction(async (tx) => {
      if (command.userId) {
        const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
        const ability = defineAbilityFor(memberships)
        if (
          !ability.can(Action.UPDATE, {
            kind: Subject.PROJECT,
            __type: Subject.PROJECT,
            projectId: command.projectId,
          })
        ) {
          throw new ForbiddenException()
        }
      }

      const project = await this.projectRepository.findById(command.projectId, tx)
      if (!project) throw new NotFoundException('Project')

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

    const result = await this.flagsmithClient.fetchAllEnvironmentFlags(
      credentials.flagsmithUrl,
      credentials.flagsmithApiKey,
      credentials.flagsmithProjectId,
    )

    if (!result.ok) {
      return { data: null, error: result.error.message }
    }

    return { data: result.data, error: null }
  }

  protected async handle(
    command: SyncFlagsmithFlagsCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: IPreparedSync,
  ): Promise<number> {
    const syncRun = await this.flagsmithFlagRepository.createSyncRun(
      { projectId: command.projectId, source: command.source },
      tx,
    )

    if (!prepared.data) {
      await this.flagsmithFlagRepository.failSyncRun(syncRun.id, prepared.error ?? 'Unknown error', tx)
      throw new AppException(
        prepared.error ?? 'Failed to sync Flagsmith flags',
        ErrorCode.INTEGRATION_ERROR,
      )
    }

    const { environments, environmentDetails, flags } = prepared.data

    for (let index = 0; index < environmentDetails.length; index += 1) {
      await this.flagsmithFlagRepository.upsertEnvironment(
        {
          projectId: command.projectId,
          name: environmentDetails[index].name,
          flagsmithApiKey: environmentDetails[index].apiKey,
          sortOrder: index,
        },
        tx,
      )
    }

    await this.flagsmithFlagRepository.reconcileFlags(
      command.projectId,
      flags.map((flag) => ({
        projectId: command.projectId,
        key: flag.key,
        createdAt: flag.createdAt ? new Date(flag.createdAt) : null,
        states: environments.map((name) => ({ environmentName: name, enabled: flag.states[name] ?? false })),
      })),
      tx,
    )

    await this.flagsmithFlagRepository.softDeleteFlagsNotInKeys(
      command.projectId,
      flags.map((flag) => flag.key),
      tx,
    )

    await this.flagsmithFlagRepository.completeSyncRun(syncRun.id, { flagCount: flags.length }, tx)

    return flags.length
  }
}
