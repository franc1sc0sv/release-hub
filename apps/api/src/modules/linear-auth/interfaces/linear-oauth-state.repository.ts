import type { RepositoryMethod } from '../../../common/cqrs/types'
import type {
  ILinearOAuthState,
  ICreateLinearOAuthStateData,
} from './linear-oauth-state.interfaces'

export abstract class ILinearOAuthStateRepository {
  abstract create: RepositoryMethod<[data: ICreateLinearOAuthStateData], void>
  abstract consume: RepositoryMethod<[nonce: string], ILinearOAuthState | null>
}
