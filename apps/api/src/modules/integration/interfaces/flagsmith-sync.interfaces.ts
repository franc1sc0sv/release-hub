import type { FlagsmithSyncSource, FlagsmithSyncStatus } from '@release-hub/db'
import type { FlagSortField } from '../../../common/types/flag-sort-field.enum'
import type { SortDirection } from '../../../common/types/sort-direction.enum'

export interface IFlagsmithFlagState {
  environmentName: string
  enabled: boolean
}

export interface IFlagsmithFlagRecord {
  key: string
  createdAt: Date | null
  states: IFlagsmithFlagState[]
}

export interface IFlagsmithFlagMatrixFilters {
  projectId: string
  search: string | undefined
  sortField: FlagSortField
  sortEnvironment: string | undefined
  sortDirection: SortDirection
  limit: number
  offset: number
}

export interface IFlagsmithFlagMatrixResult {
  environments: string[]
  totalCount: number
  items: IFlagsmithFlagRecord[]
  lastSyncedAt: Date | null
}

export interface IUpsertFlagsmithEnvironmentData {
  projectId: string
  name: string
  flagsmithApiKey: string
  sortOrder: number
}

export interface IUpsertFlagsmithFlagStateData {
  environmentName: string
  enabled: boolean
}

export interface IUpsertFlagsmithFlagData {
  projectId: string
  key: string
  createdAt: Date | null
  states: IUpsertFlagsmithFlagStateData[]
}

export interface ICreateFlagsmithSyncRunData {
  projectId: string
  source: FlagsmithSyncSource
}

export interface IFlagsmithSyncRun {
  id: string
  projectId: string
  source: FlagsmithSyncSource
  status: FlagsmithSyncStatus
  flagCount: number
  startedAt: Date
  finishedAt: Date | null
  error: string | null
}

export interface ICompleteFlagsmithSyncRunData {
  flagCount: number
}

export interface IFlagsmithEnvironmentEnabledState {
  environmentName: string
  key: string
  enabled: boolean
}

export interface IFlagsmithKnownFlagEnvironment {
  flagId: string
  environmentId: string
}
