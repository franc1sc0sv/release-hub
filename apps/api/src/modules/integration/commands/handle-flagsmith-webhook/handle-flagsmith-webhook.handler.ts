import { CommandHandler, CommandBus } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagsmithSyncSource } from '@release-hub/db'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IFlagsmithFlagRepository } from '../../interfaces/flagsmith-flag.repository'
import { FlagsmithWebhookEventType } from '../../interfaces/flagsmith-webhook.interfaces'
import type { IParsedFlagsmithWebhookEvent } from '../../interfaces/flagsmith-webhook.interfaces'
import { SyncFlagsmithFlagsCommand } from '../sync-flagsmith-flags/sync-flagsmith-flags.command'
import { HandleFlagsmithWebhookCommand } from './handle-flagsmith-webhook.command'

interface IPreparedWebhookHandling {
  parsed: IParsedFlagsmithWebhookEvent | null
  handledByFullSync: boolean
}

@CommandHandler(HandleFlagsmithWebhookCommand)
export class HandleFlagsmithWebhookHandler extends PreparedCommandHandler<
  HandleFlagsmithWebhookCommand,
  IPreparedWebhookHandling,
  void
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
    private readonly commandBus: CommandBus,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: HandleFlagsmithWebhookCommand): Promise<IPreparedWebhookHandling> {
    const parsed = this.parsePayload(command.payload)
    if (!parsed) return { parsed: null, handledByFullSync: false }

    const known = await this.db.$transaction((tx) =>
      this.flagsmithFlagRepository.findFlagAndEnvironmentIds(
        command.projectId,
        parsed.featureKey,
        parsed.environmentName,
        tx,
      ),
    )

    if (!known) {
      await this.commandBus.execute(
        new SyncFlagsmithFlagsCommand(command.projectId, null, FlagsmithSyncSource.webhook),
      )
      return { parsed, handledByFullSync: true }
    }

    return { parsed, handledByFullSync: false }
  }

  protected async handle(
    command: HandleFlagsmithWebhookCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: IPreparedWebhookHandling,
  ): Promise<void> {
    if (!prepared.parsed || prepared.handledByFullSync) return

    if (prepared.parsed.eventType === FlagsmithWebhookEventType.FLAG_DELETED) {
      await this.flagsmithFlagRepository.softDeleteFlagByKey(command.projectId, prepared.parsed.featureKey, tx)
      return
    }

    await this.flagsmithFlagRepository.upsertFlagWithStates(
      {
        projectId: command.projectId,
        key: prepared.parsed.featureKey,
        createdAt: null,
        states: [{ environmentName: prepared.parsed.environmentName, enabled: prepared.parsed.enabled }],
      },
      tx,
    )
  }

  private parsePayload(payload: HandleFlagsmithWebhookCommand['payload']): IParsedFlagsmithWebhookEvent | null {
    const state = payload.data.new_state ?? payload.data.previous_state
    if (!state) return null

    return {
      eventType: payload.event_type,
      featureKey: state.feature.name,
      environmentName: state.environment.name,
      enabled: payload.event_type === FlagsmithWebhookEventType.FLAG_DELETED ? false : state.enabled,
    }
  }
}
