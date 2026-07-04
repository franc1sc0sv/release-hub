import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineGateAbility, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { INotificationRepository } from '../../interfaces/notification.repository'
import { MarkNotificationReadCommand } from './mark-notification-read.command'

@CommandHandler(MarkNotificationReadCommand)
export class MarkNotificationReadHandler extends BaseCommandHandler<MarkNotificationReadCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly notificationRepository: INotificationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: MarkNotificationReadCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    const ability = defineGateAbility()

    if (!ability.can(Action.UPDATE, Subject.USER)) {
      throw new ForbiddenException()
    }

    await this.notificationRepository.markRead(command.id, command.userId, tx)
    return true
  }
}
