import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IFeatureInRelease } from '../../feature/interfaces/feature.interfaces'
import type { FeatureState } from '../../../common/types/feature-state.enum'

export abstract class IFeatureInReleaseRepository {
  abstract findByRelease: RepositoryMethod<[releaseId: string], IFeatureInRelease[]>
  abstract upsertState: RepositoryMethod<[featureId: string, releaseId: string, state: FeatureState], IFeatureInRelease>
}
