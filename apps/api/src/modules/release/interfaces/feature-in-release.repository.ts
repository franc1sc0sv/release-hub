import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IFeatureInRelease } from '../../feature/interfaces/feature.interfaces'

export abstract class IFeatureInReleaseRepository {
  abstract findByRelease: RepositoryMethod<[releaseId: string], IFeatureInRelease[]>
}
