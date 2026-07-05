import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { RepoPullRequestEvent } from '../../events/repo-pull-request.event'
import { HandleGithubPullRequestWebhookCommand } from './handle-github-pull-request-webhook.command'

@CommandHandler(HandleGithubPullRequestWebhookCommand)
export class HandleGithubPullRequestWebhookHandler extends BaseCommandHandler<
  HandleGithubPullRequestWebhookCommand,
  void
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: HandleGithubPullRequestWebhookCommand,
    _tx: TxClient,
    events: IDomainEvent[],
  ): Promise<void> {
    const pullRequest = command.payload.pull_request
    const action = command.payload.action
    if (!pullRequest || !action) return

    events.push(
      new RepoPullRequestEvent(
        command.projectId,
        action,
        pullRequest.number,
        pullRequest.merged,
      ),
    )
  }
}
