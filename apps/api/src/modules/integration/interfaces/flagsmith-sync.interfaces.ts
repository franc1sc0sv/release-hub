import type { FlagsmithSyncSource, FlagsmithSyncStatus } from '@release-hub/db'
import type { FlagSortField } from '../../../common/types/flag-sort-field.enum'
import type { SortDirection } from '../../../common/types/sort-direction.enum'
import type { FlagDeploymentStatus } from '../../../common/types/flag-deployment-status.enum'
import type { FlagActivityFilter } from '../../../common/types/flag-activity-filter.enum'

export interface IFlagsmithFlagState {
  environmentName: string
  enabled: boolean
  value: string | null
}

export interface IFlagsmithFlagRecord {
  key: string
  createdAt: Date | null
  states: IFlagsmithFlagState[]
}

export interface IFlagsmithFlagMatrixItem extends IFlagsmithFlagRecord {
  deploymentStatus: FlagDeploymentStatus
}

export interface IFlagsmithFlagMatrixFilters {
  projectId: string
  search: string | undefined
  sortField: FlagSortField
  sortEnvironment: string | undefined
  sortDirection: SortDirection
  statuses: FlagDeploymentStatus[] | undefined
  activity: FlagActivityFilter | undefined
  watchedEnvironments: string[]
  limit: number | undefined
  offset: number
}

export interface IFlagsmithFlagMatrixResult {
  environments: string[]
  totalCount: number
  items: IFlagsmithFlagMatrixItem[]
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
  value: string | null
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

export interface IFlagsmithFlagStateChange {
  flagId: string
  key: string
  environmentName: string
  previousEnabled: boolean
  newEnabled: boolean
}

export interface IFlagsmithFlagValueChange {
  flagId: string
  key: string
  environmentName: string
  previousValue: string | null
  newValue: string | null
}

export interface IReconcileFlagsResult {
  addedKeys: string[]
  enabledChanges: IFlagsmithFlagStateChange[]
  valueChanges: IFlagsmithFlagValueChange[]
}

export interface IFlagSyncReport {
  flagCount: number
  addedKeys: string[]
  removedKeys: string[]
  environmentsAdded: string[]
  enabledChanges: IFlagsmithFlagStateChange[]
  valueChanges: IFlagsmithFlagValueChange[]
}

export interface IUpsertFlagsmithFlagStateChangeResult {
  environmentName: string
  previousEnabled: boolean | null
  newEnabled: boolean
  previousValue: string | null
  newValue: string | null
}

export interface IUpsertFlagsmithFlagWithStatesResult {
  flagId: string
  isNewFlag: boolean
  stateChanges: IUpsertFlagsmithFlagStateChangeResult[]
}

export interface IFlagsmithFlagDetailEnvironmentState {
  name: string
  enabled: boolean
  value: string | null
  updatedAt: Date
}

export interface IFlagsmithFlagDetail {
  id: string
  key: string
  lastSyncedAt: Date | null
  deletedAt: Date | null
  environments: IFlagsmithFlagDetailEnvironmentState[]
}

export interface IFlagsmithEnvironmentCredential {
  name: string
  flagsmithApiKey: string
}

export interface ISetFlagStateTarget {
  key: string
  environmentName: string
  enabled: boolean
}

export interface IFlagStateUpdate {
  flagId: string
  key: string
  environmentName: string
  previousEnabled: boolean
  newEnabled: boolean
}
