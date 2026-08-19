import type {
  FlagDeploymentStatus,
  FlagActivityFilter,
  GetFlagsQuery,
  SortDirection,
} from '@/generated/graphql'
import {
  FlagActivityFilterValue,
  FlagSortFieldValue,
  SortDirectionValue,
} from '../constants/flag-enums'
import type { IFlagFilters } from '../hooks/use-flag-filters'

export type FlagListItem = GetFlagsQuery['getFlags']['items'][number]

type FlagComparator = (left: FlagListItem, right: FlagListItem) => number

function matchesSearch(item: FlagListItem, loweredSearch: string): boolean {
  if (loweredSearch === '') return true
  return item.key.toLowerCase().includes(loweredSearch)
}

function matchesStatuses(item: FlagListItem, statuses: FlagDeploymentStatus[]): boolean {
  if (statuses.length === 0) return true
  return statuses.includes(item.deploymentStatus)
}

function hasEnabledEnvironment(item: FlagListItem): boolean {
  return item.environments.some((environment) => environment.enabled)
}

function matchesActivity(item: FlagListItem, activity: FlagActivityFilter | undefined): boolean {
  if (activity === undefined) return true
  return activity === FlagActivityFilterValue.ACTIVE
    ? hasEnabledEnvironment(item)
    : !hasEnabledEnvironment(item)
}

function compareKeysAscending(left: FlagListItem, right: FlagListItem): number {
  if (left.key === right.key) return 0
  return left.key < right.key ? -1 : 1
}

function toTimestamp(createdAt: string | null): number | null {
  return createdAt === null ? null : new Date(createdAt).getTime()
}

function compareNullableTimestamps(
  left: number | null,
  right: number | null,
  direction: SortDirection,
): number {
  if (left === null && right === null) return 0
  if (left === null) return direction === SortDirectionValue.ASC ? 1 : -1
  if (right === null) return direction === SortDirectionValue.ASC ? -1 : 1
  return direction === SortDirectionValue.ASC ? left - right : right - left
}

function isEnabledInEnvironment(item: FlagListItem, environmentName: string): boolean {
  return item.environments.find((environment) => environment.name === environmentName)?.enabled ?? false
}

function compareEnabledFlags(left: boolean, right: boolean, direction: SortDirection): number {
  const ascending = Number(left) - Number(right)
  return direction === SortDirectionValue.ASC ? ascending : -ascending
}

function resolveSortEnvironment(
  items: readonly FlagListItem[],
  filters: IFlagFilters,
): string | undefined {
  const { sortEnvironment } = filters
  if (filters.sortField !== FlagSortFieldValue.ENVIRONMENT || sortEnvironment === undefined) {
    return undefined
  }
  const exists = items.some((item) =>
    item.environments.some((environment) => environment.name === sortEnvironment),
  )
  return exists ? sortEnvironment : undefined
}

function buildComparator(items: readonly FlagListItem[], filters: IFlagFilters): FlagComparator {
  const { sortDirection } = filters

  if (filters.sortField === FlagSortFieldValue.NAME) {
    return (left, right) => {
      const ascending = compareKeysAscending(left, right)
      return sortDirection === SortDirectionValue.ASC ? ascending : -ascending
    }
  }

  const sortEnvironment = resolveSortEnvironment(items, filters)
  if (sortEnvironment !== undefined) {
    return (left, right) =>
      compareEnabledFlags(
        isEnabledInEnvironment(left, sortEnvironment),
        isEnabledInEnvironment(right, sortEnvironment),
        sortDirection,
      ) || compareKeysAscending(left, right)
  }

  return (left, right) =>
    compareNullableTimestamps(
      toTimestamp(left.createdAt),
      toTimestamp(right.createdAt),
      sortDirection,
    ) || compareKeysAscending(left, right)
}

export function applyFlagFilters(
  items: readonly FlagListItem[],
  filters: IFlagFilters,
): FlagListItem[] {
  const loweredSearch = filters.search.toLowerCase()

  return items
    .filter(
      (item) =>
        matchesSearch(item, loweredSearch) &&
        matchesStatuses(item, filters.statuses) &&
        matchesActivity(item, filters.activity),
    )
    .sort(buildComparator(items, filters))
}
