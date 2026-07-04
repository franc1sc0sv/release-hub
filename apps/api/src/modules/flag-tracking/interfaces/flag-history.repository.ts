import type { FlagHistoryEventType, FlagHistorySource } from '@release-hub/db'
import type { RepositoryMethod, IBaseRepository } from '../../../common/cqrs/types'

export const FLAG_HISTORY_PROJECT_SCOPE_KEY = '*'

export interface ICreateFlagHistoryEventData {
  projectId: string
  flagKey: string
  trackedFlagId?: string | null
  flagsmithFlagId?: string | null
  type: FlagHistoryEventType
  environmentName?: string | null
  previousValue?: string | null
  newValue?: string | null
  releaseId?: string | null
  actorId?: string | null
  source: FlagHistorySource
  occurredAt?: Date
}

export interface IFlagHistoryEvent {
  id: string
  projectId: string
  flagKey: string
  trackedFlagId: string | null
  flagsmithFlagId: string | null
  type: FlagHistoryEventType
  environmentName: string | null
  previousValue: string | null
  newValue: string | null
  releaseId: string | null
  releaseName: string | null
  actorId: string | null
  actorName: string | null
  source: FlagHistorySource
  occurredAt: Date
}

export interface IFlagHistoryPageFilters {
  projectId: string
  flagKey: string
  limit: number
  offset: number
}

export interface IFlagHistoryPage {
  items: IFlagHistoryEvent[]
  totalCount: number
}

export abstract class IFlagHistoryRepository implements IBaseRepository<IFlagHistoryEvent> {
  abstract findById: RepositoryMethod<[id: string], IFlagHistoryEvent | null>
  abstract create: RepositoryMethod<[data: ICreateFlagHistoryEventData], IFlagHistoryEvent>
  abstract createMany: RepositoryMethod<[data: ICreateFlagHistoryEventData[]], void>
  abstract findPage: RepositoryMethod<[filters: IFlagHistoryPageFilters], IFlagHistoryPage>
}
