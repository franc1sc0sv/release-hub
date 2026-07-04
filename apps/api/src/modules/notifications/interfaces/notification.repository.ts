import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type {
  INotification,
  ICreateNotificationData,
  INotificationsPageFilters,
  INotificationsPage,
} from './notification.interfaces'

export abstract class INotificationRepository implements IBaseRepository<INotification> {
  abstract findById: RepositoryMethod<[id: string], INotification | null>
  abstract createMany: RepositoryMethod<[data: ICreateNotificationData[]], void>
  abstract findPageForUser: RepositoryMethod<[filters: INotificationsPageFilters], INotificationsPage>
  abstract countUnread: RepositoryMethod<[userId: string], number>
  abstract markRead: RepositoryMethod<[id: string, userId: string], void>
  abstract markAllRead: RepositoryMethod<[userId: string], void>
}
