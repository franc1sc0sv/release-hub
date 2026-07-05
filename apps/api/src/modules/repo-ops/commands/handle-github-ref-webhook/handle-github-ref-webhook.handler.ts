import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { RepoRefChangedEvent } from '../../events/repo-ref-changed.event'
import { HandleGithubRefWebhookCommand } from './handle-github-ref-webhook.command'

@CommandHandler(HandleGithubRefWebhookCommand)
export class HandleGithubRefWebhookHandler extends BaseCommandHandler<HandleGithubRefWebhookCommand, void> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: HandleGithubRefWebhookCommand,
    _tx: TxClient,
    events: IDomainEvent[],
  ): Promise<void> {
    const ref = command.payload.ref
    if (!ref) return

    events.push(
      new RepoRefChangedEvent(
        command.projectId,
        ref,
        command.payload.ref_type ?? '',
        command.action,
      ),
    )
  }
}
