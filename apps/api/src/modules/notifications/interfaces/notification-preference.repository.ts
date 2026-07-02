import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type {
  IUserNotificationPreference,
  IUpsertUserNotificationPreferenceData,
} from './notification.interfaces'

export abstract class INotificationPreferenceRepository implements IBaseRepository<IUserNotificationPreference> {
  abstract findById: RepositoryMethod<[id: string], IUserNotificationPreference | null>
  abstract findAllForUserAndProject: RepositoryMethod<
    [userId: string, projectId: string],
    IUserNotificationPreference[]
  >
  abstract findAllForUsersAndProject: RepositoryMethod<
    [userIds: string[], projectId: string],
    IUserNotificationPreference[]
  >
  abstract upsert: RepositoryMethod<[data: IUpsertUserNotificationPreferenceData], IUserNotificationPreference>
}
