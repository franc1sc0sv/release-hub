import type { RepositoryMethod } from '../../../common/cqrs/types'
import type {
  IProjectSlackConnection,
  IUpsertProjectSlackConnectionData,
  IUpdateSlackNotificationSettingsData,
  ISetSlackChannelData,
} from './slack-connection.interfaces'

export abstract class ISlackConnectionRepository {
  abstract upsertForProject: RepositoryMethod<[data: IUpsertProjectSlackConnectionData], IProjectSlackConnection>
  abstract findByProject: RepositoryMethod<[projectId: string], IProjectSlackConnection | null>
  abstract deleteByProject: RepositoryMethod<[projectId: string], void>
  abstract updateNotificationSettings: RepositoryMethod<
    [projectId: string, data: IUpdateSlackNotificationSettingsData],
    IProjectSlackConnection
  >
  abstract updateChannel: RepositoryMethod<[projectId: string, data: ISetSlackChannelData], IProjectSlackConnection>
  abstract setProjectSlackEnabled: RepositoryMethod<[projectId: string, enabled: boolean], void>
}
