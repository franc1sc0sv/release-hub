import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type { IFeatureStateEvent, ICreateFeatureStateEventData } from './feature.interfaces'

export abstract class IFeatureStateEventRepository implements IBaseRepository<IFeatureStateEvent> {
  abstract findById: RepositoryMethod<[id: string], IFeatureStateEvent | null>
  abstract findAllByFeature: RepositoryMethod<[featureId: string], IFeatureStateEvent[]>
  abstract create: RepositoryMethod<[data: ICreateFeatureStateEventData], IFeatureStateEvent>
}
