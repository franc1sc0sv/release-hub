import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'
import type {
  ISummaryProfile,
  ICreateSummaryProfileData,
  IUpdateSummaryProfileData,
} from './summary-profile.interfaces'

export abstract class ISummaryProfileRepository implements IBaseRepository<ISummaryProfile> {
  abstract findById: RepositoryMethod<[id: string], ISummaryProfile | null>
  abstract listByProject: RepositoryMethod<[projectId: string], ISummaryProfile[]>
  abstract create: RepositoryMethod<[data: ICreateSummaryProfileData], ISummaryProfile>
  abstract update: RepositoryMethod<[id: string, data: IUpdateSummaryProfileData], ISummaryProfile>
  abstract softDelete: RepositoryMethod<[id: string], void>
}
