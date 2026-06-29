import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IProjectLinearConnection, IUpsertProjectLinearConnectionData } from './linear-connection.interfaces'

export abstract class ILinearConnectionRepository {
  abstract upsertForProject: RepositoryMethod<[data: IUpsertProjectLinearConnectionData], IProjectLinearConnection>
  abstract findByProject: RepositoryMethod<[projectId: string], IProjectLinearConnection | null>
  abstract deleteByProject: RepositoryMethod<[projectId: string], void>
}
