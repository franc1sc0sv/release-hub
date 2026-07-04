import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineGateAbility, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { INotificationRepository } from '../../interfaces/notification.repository'
import { GetUnreadNotificationsCountQuery } from './get-unread-notifications-count.query'

@QueryHandler(GetUnreadNotificationsCountQuery)
export class GetUnreadNotificationsCountHandler extends BaseQueryHandler<
  GetUnreadNotificationsCountQuery,
  number
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly notificationRepository: INotificationRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetUnreadNotificationsCountQuery, tx: TxClient): Promise<number> {
    const ability = defineGateAbility()

    if (!ability.can(Action.READ, Subject.USER)) {
      throw new ForbiddenException()
    }

    return this.notificationRepository.countUnread(query.userId, tx)
  }
}
