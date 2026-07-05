import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { RepoPushReceivedEvent } from '../../events/repo-push-received.event'
import { HandleGithubPushWebhookCommand } from './handle-github-push-webhook.command'

@CommandHandler(HandleGithubPushWebhookCommand)
export class HandleGithubPushWebhookHandler extends BaseCommandHandler<HandleGithubPushWebhookCommand, void> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: HandleGithubPushWebhookCommand,
    _tx: TxClient,
    events: IDomainEvent[],
  ): Promise<void> {
    const ref = command.payload.ref
    if (!ref) return

    events.push(
      new RepoPushReceivedEvent(
        command.projectId,
        ref,
        command.payload.before ?? '',
        command.payload.after ?? '',
        command.payload.commits?.length ?? 0,
      ),
    )
  }
}
