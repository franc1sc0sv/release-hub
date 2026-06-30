import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IBaseRepository } from '../../../common/cqrs/types'
import type { IFeature, ICreateFeatureData, IFeaturePullRequest } from './feature.interfaces'
import type { IRelease } from '../../release/interfaces/release.interfaces'
import type { FeatureState } from '../../../common/types/feature-state.enum'

export interface ICreateSuggestedFeatureData {
  projectId: string
  name: string
  description: string
}

export abstract class IFeatureRepository implements IBaseRepository<IFeature> {
  abstract findById: RepositoryMethod<[id: string], IFeature | null>
  abstract findAllByProject: RepositoryMethod<[projectId: string], IFeature[]>
  abstract findSuggestedByIds: RepositoryMethod<[ids: string[]], IFeature[]>
  abstract findSuggestedByProject: RepositoryMethod<[projectId: string], IFeature[]>
  abstract updateState: RepositoryMethod<[id: string, state: FeatureState], IFeature>
  abstract findReleasesForFeature: RepositoryMethod<[featureId: string], IRelease[]>
  abstract findPullRequestsForFeature: RepositoryMethod<[featureId: string], IFeaturePullRequest[]>
  abstract create: RepositoryMethod<[data: ICreateFeatureData], IFeature>
  abstract createSuggested: RepositoryMethod<[data: ICreateSuggestedFeatureData], IFeature>
  abstract update: RepositoryMethod<[id: string, data: Partial<Pick<IFeature, 'name' | 'description' | 'tags'>>], IFeature>
  abstract acceptSuggested: RepositoryMethod<[id: string, data: Partial<Pick<IFeature, 'name' | 'description' | 'tags'>>], IFeature>
  abstract softDelete: RepositoryMethod<[id: string], void>
}
