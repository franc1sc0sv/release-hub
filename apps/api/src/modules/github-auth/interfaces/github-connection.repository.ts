import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IGithubConnection, IUpsertGithubConnectionData } from './github-connection.interfaces'

export abstract class IGithubConnectionRepository {
  abstract upsertForUser: RepositoryMethod<[data: IUpsertGithubConnectionData], IGithubConnection>
  abstract findByUserId: RepositoryMethod<[userId: string], IGithubConnection | null>
  abstract deleteByUserId: RepositoryMethod<[userId: string], void>
}
