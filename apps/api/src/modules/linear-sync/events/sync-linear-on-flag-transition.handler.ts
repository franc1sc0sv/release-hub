import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { OnEvent } from '@nestjs/event-emitter'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { FlagWebhookTransition } from '../../integration/events/integration.events'
import type { FlagWebhookTransitionEvent } from '../../integration/events/flag-webhook-transition.event'
import { SyncLinearCommand } from '../commands/sync-linear/sync-linear.command'
import { isProductionEnvironment } from '../utils/plan-linear-sync'

const SYNCED_TRANSITIONS: ReadonlySet<FlagWebhookTransition> = new Set([
  FlagWebhookTransition.ENABLED,
  FlagWebhookTransition.DISABLED,
])

@Injectable()
export class SyncLinearOnFlagTransitionHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: ILogger,
  ) {}

  @OnEvent('flagsmith.flag.webhook-transition')
  async onFlagTransition(event: FlagWebhookTransitionEvent): Promise<void> {
    if (!SYNCED_TRANSITIONS.has(event.transition)) return
    if (!event.environmentName || !isProductionEnvironment(event.environmentName)) return

    try {
      await this.commandBus.execute(new SyncLinearCommand(event.projectId, null, event.flagKey, null))
    } catch (error) {
      this.logger.error(
        {
          event: LogEvent.OPERATION_ERROR,
          projectId: event.projectId,
          flagKey: event.flagKey,
          err: error instanceof Error ? error.message : String(error),
        },
        LogEvent.OPERATION_ERROR,
      )
    }
  }
}
