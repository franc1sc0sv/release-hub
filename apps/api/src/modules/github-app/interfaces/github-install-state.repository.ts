import type { RepositoryMethod } from '../../../common/cqrs/types'
import type {
  IGithubInstallState,
  ICreateGithubInstallStateData,
} from './github-install-state.interfaces'

export abstract class IGithubInstallStateRepository {
  abstract create: RepositoryMethod<[data: ICreateGithubInstallStateData], void>
  abstract consume: RepositoryMethod<[nonce: string], IGithubInstallState | null>
}
