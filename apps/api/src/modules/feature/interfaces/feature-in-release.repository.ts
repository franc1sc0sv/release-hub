import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { FeatureState } from '../../../common/types/feature-state.enum'
import type { IFeatureInRelease } from './feature.interfaces'

export abstract class IFeatureInReleaseRepository implements IBaseRepository<IFeatureInRelease> {
  abstract findById: RepositoryMethod<[id: string], IFeatureInRelease | null>
  abstract findByFeatureAndRelease: RepositoryMethod<[featureId: string, releaseId: string], IFeatureInRelease | null>
  abstract upsertState: RepositoryMethod<[featureId: string, releaseId: string, state: FeatureState], IFeatureInRelease>
}
