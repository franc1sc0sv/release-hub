import { CommandHandler, CommandBus } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { FlagsmithSyncSource, FlagHistoryEventType, FlagHistorySource } from '@release-hub/db'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithFlagRepository } from '../../interfaces/flagsmith-flag.repository'
import { FlagsmithWebhookEventType } from '../../interfaces/flagsmith-webhook.interfaces'
import type { IParsedFlagsmithWebhookEvent } from '../../interfaces/flagsmith-webhook.interfaces'
import { stringifyFlagsmithValue } from '../../utils/stringify-flagsmith-value'
import { FlagWebhookTransition } from '../../events/integration.events'
import { FlagWebhookTransitionEvent } from '../../events/flag-webhook-transition.event'
import { FlagConflictDetectedEvent } from '../../events/flag-conflict-detected.event'
import { IFlagHistoryRepository } from '../../../flag-tracking/interfaces/flag-history.repository'
import type { ICreateFlagHistoryEventData } from '../../../flag-tracking/interfaces/flag-history.repository'
import { IReleaseFlagDecisionRepository } from '../../../flag-tracking/interfaces/release-flag-decision.repository'
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
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
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
    events: IDomainEvent[],
    prepared: IPreparedWebhookHandling,
  ): Promise<void> {
    if (!prepared.parsed || prepared.handledByFullSync) return

    const parsed = prepared.parsed
    const historyRows: ICreateFlagHistoryEventData[] = []
    const project = await this.projectRepository.findById(command.projectId, tx)
    const watchedEnvironments = project?.conflictEnvironments ?? []

    if (parsed.eventType === FlagsmithWebhookEventType.FLAG_DELETED) {
      const existing = await this.flagsmithFlagRepository.findFlagAndEnvironmentIds(
        command.projectId,
        parsed.featureKey,
        parsed.environmentName,
        tx,
      )
      await this.flagsmithFlagRepository.softDeleteFlagByKey(command.projectId, parsed.featureKey, tx)

      historyRows.push({
        projectId: command.projectId,
        flagKey: parsed.featureKey,
        flagsmithFlagId: existing?.flagId ?? null,
        type: FlagHistoryEventType.flag_deleted,
        source: FlagHistorySource.webhook,
      })
      await this.flagHistoryRepository.createMany(historyRows, tx)

      events.push(
        new FlagWebhookTransitionEvent(command.projectId, parsed.featureKey, null, FlagWebhookTransition.DELETED),
      )
      return
    }

    const result = await this.flagsmithFlagRepository.upsertFlagWithStates(
      {
        projectId: command.projectId,
        key: parsed.featureKey,
        createdAt: null,
        states: [{ environmentName: parsed.environmentName, enabled: parsed.enabled, value: parsed.value }],
      },
      tx,
    )

    if (result.isNewFlag) {
      historyRows.push({
        projectId: command.projectId,
        flagKey: parsed.featureKey,
        flagsmithFlagId: result.flagId,
        type: FlagHistoryEventType.flag_created,
        source: FlagHistorySource.webhook,
      })
      events.push(
        new FlagWebhookTransitionEvent(
          command.projectId,
          parsed.featureKey,
          parsed.environmentName,
          FlagWebhookTransition.CREATED,
        ),
      )
    }

    let disabledTransition = false

    for (const change of result.stateChanges) {
      if (!result.isNewFlag && change.previousEnabled !== null && change.previousEnabled !== change.newEnabled) {
        historyRows.push({
          projectId: command.projectId,
          flagKey: parsed.featureKey,
          flagsmithFlagId: result.flagId,
          type: change.newEnabled ? FlagHistoryEventType.flag_enabled : FlagHistoryEventType.flag_disabled,
          environmentName: change.environmentName,
          previousValue: String(change.previousEnabled),
          newValue: String(change.newEnabled),
          source: FlagHistorySource.webhook,
        })
        events.push(
          new FlagWebhookTransitionEvent(
            command.projectId,
            parsed.featureKey,
            change.environmentName,
            change.newEnabled ? FlagWebhookTransition.ENABLED : FlagWebhookTransition.DISABLED,
          ),
        )
        if (
          !change.newEnabled &&
          (watchedEnvironments.length === 0 || watchedEnvironments.includes(change.environmentName))
        ) {
          disabledTransition = true
        }
      }

      if (!result.isNewFlag && change.previousValue !== change.newValue) {
        historyRows.push({
          projectId: command.projectId,
          flagKey: parsed.featureKey,
          flagsmithFlagId: result.flagId,
          type: FlagHistoryEventType.flag_value_changed,
          environmentName: change.environmentName,
          previousValue: change.previousValue,
          newValue: change.newValue,
          source: FlagHistorySource.webhook,
        })
        events.push(
          new FlagWebhookTransitionEvent(
            command.projectId,
            parsed.featureKey,
            change.environmentName,
            FlagWebhookTransition.VALUE_CHANGED,
            change.previousValue,
            change.newValue,
          ),
        )
      }
    }

    if (disabledTransition) {
      const conflict = await this.releaseFlagDecisionRepository.findActiveEnableDecisionForFlag(
        command.projectId,
        parsed.featureKey,
        tx,
      )
      if (conflict) {
        historyRows.push({
          projectId: command.projectId,
          flagKey: parsed.featureKey,
          trackedFlagId: conflict.trackedFlagId,
          flagsmithFlagId: result.flagId,
          type: FlagHistoryEventType.conflict_detected,
          environmentName: parsed.environmentName,
          releaseId: conflict.releaseId,
          source: FlagHistorySource.webhook,
        })
        events.push(
          new FlagConflictDetectedEvent(
            command.projectId,
            parsed.featureKey,
            parsed.environmentName,
            conflict.releaseId,
            conflict.releaseName,
          ),
        )
      }
    }

    await this.flagHistoryRepository.createMany(historyRows, tx)
  }

  private parsePayload(payload: HandleFlagsmithWebhookCommand['payload']): IParsedFlagsmithWebhookEvent | null {
    const state = payload.data.new_state ?? payload.data.previous_state
    if (!state) return null

    const isDeleted = payload.event_type === FlagsmithWebhookEventType.FLAG_DELETED

    return {
      eventType: payload.event_type,
      featureKey: state.feature.name,
      environmentName: state.environment.name,
      enabled: isDeleted ? false : state.enabled,
      value: isDeleted ? null : stringifyFlagsmithValue(state.feature_state_value),
    }
  }
}
