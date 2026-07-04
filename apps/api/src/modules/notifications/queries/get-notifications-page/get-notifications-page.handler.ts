import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineGateAbility, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { INotificationRepository } from '../../interfaces/notification.repository'
import { NotificationsPageType } from '../../types/notifications-page.type'
import { toNotificationEntryType } from '../../types/notification.mappers'
import { GetNotificationsPageQuery } from './get-notifications-page.query'

@QueryHandler(GetNotificationsPageQuery)
export class GetNotificationsPageHandler extends BaseQueryHandler<
  GetNotificationsPageQuery,
  NotificationsPageType
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly notificationRepository: INotificationRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetNotificationsPageQuery, tx: TxClient): Promise<NotificationsPageType> {
    const ability = defineGateAbility()

    if (!ability.can(Action.READ, Subject.USER)) {
      throw new ForbiddenException()
    }

    const page = await this.notificationRepository.findPageForUser(
      {
        userId: query.userId,
        limit: query.limit,
        offset: query.offset,
        projectId: query.projectId,
      },
      tx,
    )

    return {
      items: page.items.map(toNotificationEntryType),
      totalCount: page.totalCount,
      hasMore: page.hasMore,
    }
  }
}
