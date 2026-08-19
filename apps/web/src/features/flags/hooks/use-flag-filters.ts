import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type {
  FlagActivityFilter,
  FlagDeploymentStatus,
  FlagSortField,
  SortDirection,
} from '@/generated/graphql'
import {
  FLAG_DEPLOYMENT_STATUS_OPTIONS,
  FlagActivityFilterValue,
  FlagSortFieldValue,
  SortDirectionValue,
} from '../constants/flag-enums'

const FlagFilterParam = {
  SEARCH: 'q',
  SORT_FIELD: 'sort',
  SORT_DIRECTION: 'dir',
  SORT_ENVIRONMENT: 'env',
  STATUSES: 'status',
  ACTIVITY: 'activity',
  HIDDEN_ENVIRONMENTS: 'hide',
} as const

const FLAG_SORT_FIELD_OPTIONS: readonly FlagSortField[] = Object.values(FlagSortFieldValue)
const SORT_DIRECTION_OPTIONS: readonly SortDirection[] = Object.values(SortDirectionValue)
const FLAG_ACTIVITY_FILTER_OPTIONS: readonly FlagActivityFilter[] =
  Object.values(FlagActivityFilterValue)

const DEFAULT_SORT_FIELD: FlagSortField = FlagSortFieldValue.CREATED
const DEFAULT_SORT_DIRECTION: SortDirection = SortDirectionValue.DESC
const LIST_SEPARATOR = ','

export interface IFlagFilters {
  search: string
  sortField: FlagSortField
  sortDirection: SortDirection
  sortEnvironment: string | undefined
  statuses: FlagDeploymentStatus[]
  activity: FlagActivityFilter | undefined
  hiddenEnvironments: string[]
}

interface IFlagFiltersController {
  filters: IFlagFilters
  setSearch: (value: string) => void
  setSort: (field: FlagSortField, environmentName?: string) => void
  setStatuses: (value: FlagDeploymentStatus[]) => void
  setActivity: (value: FlagActivityFilter | undefined) => void
  toggleEnvironmentColumn: (name: string, hidden: boolean) => void
}

function parseList(raw: string | null): string[] {
  if (!raw) return []
  return raw.split(LIST_SEPARATOR).filter((entry) => entry.length > 0)
}

function parseText(raw: string | null): string | undefined {
  if (!raw) return undefined
  return raw
}

function parseSortField(raw: string | null): FlagSortField {
  return FLAG_SORT_FIELD_OPTIONS.find((field) => field === raw) ?? DEFAULT_SORT_FIELD
}

function parseSortDirection(raw: string | null): SortDirection {
  return SORT_DIRECTION_OPTIONS.find((direction) => direction === raw) ?? DEFAULT_SORT_DIRECTION
}

function parseStatuses(raw: string | null): FlagDeploymentStatus[] {
  const requested = parseList(raw)
  return FLAG_DEPLOYMENT_STATUS_OPTIONS.filter((status) => requested.includes(status))
}

function parseActivity(raw: string | null): FlagActivityFilter | undefined {
  return FLAG_ACTIVITY_FILTER_OPTIONS.find((activity) => activity === raw)
}

function writeParam(params: URLSearchParams, name: string, value: string | undefined): void {
  if (!value) {
    params.delete(name)
    return
  }
  params.set(name, value)
}

export function useFlagFilters(): IFlagFiltersController {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<IFlagFilters>(
    () => ({
      search: searchParams.get(FlagFilterParam.SEARCH) ?? '',
      sortField: parseSortField(searchParams.get(FlagFilterParam.SORT_FIELD)),
      sortDirection: parseSortDirection(searchParams.get(FlagFilterParam.SORT_DIRECTION)),
      sortEnvironment: parseText(searchParams.get(FlagFilterParam.SORT_ENVIRONMENT)),
      statuses: parseStatuses(searchParams.get(FlagFilterParam.STATUSES)),
      activity: parseActivity(searchParams.get(FlagFilterParam.ACTIVITY)),
      hiddenEnvironments: parseList(searchParams.get(FlagFilterParam.HIDDEN_ENVIRONMENTS)),
    }),
    [searchParams],
  )

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          mutate(next)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setSearch = useCallback(
    (value: string) => {
      updateParams((params) => writeParam(params, FlagFilterParam.SEARCH, value))
    },
    [updateParams],
  )

  const setSort = useCallback(
    (field: FlagSortField, environmentName?: string) => {
      updateParams((params) => {
        const currentField = parseSortField(params.get(FlagFilterParam.SORT_FIELD))
        const currentEnvironment = parseText(params.get(FlagFilterParam.SORT_ENVIRONMENT))
        const currentDirection = parseSortDirection(params.get(FlagFilterParam.SORT_DIRECTION))
        const isSameTarget =
          field === currentField &&
          (field !== FlagSortFieldValue.ENVIRONMENT || environmentName === currentEnvironment)
        const direction = isSameTarget
          ? currentDirection === SortDirectionValue.ASC
            ? SortDirectionValue.DESC
            : SortDirectionValue.ASC
          : DEFAULT_SORT_DIRECTION

        writeParam(
          params,
          FlagFilterParam.SORT_FIELD,
          field === DEFAULT_SORT_FIELD ? undefined : field,
        )
        writeParam(
          params,
          FlagFilterParam.SORT_DIRECTION,
          direction === DEFAULT_SORT_DIRECTION ? undefined : direction,
        )
        if (!isSameTarget) {
          writeParam(params, FlagFilterParam.SORT_ENVIRONMENT, environmentName)
        }
      })
    },
    [updateParams],
  )

  const setStatuses = useCallback(
    (value: FlagDeploymentStatus[]) => {
      updateParams((params) =>
        writeParam(params, FlagFilterParam.STATUSES, value.join(LIST_SEPARATOR)),
      )
    },
    [updateParams],
  )

  const setActivity = useCallback(
    (value: FlagActivityFilter | undefined) => {
      updateParams((params) => writeParam(params, FlagFilterParam.ACTIVITY, value))
    },
    [updateParams],
  )

  const toggleEnvironmentColumn = useCallback(
    (name: string, hidden: boolean) => {
      updateParams((params) => {
        const remaining = parseList(params.get(FlagFilterParam.HIDDEN_ENVIRONMENTS)).filter(
          (entry) => entry !== name,
        )
        const next = hidden ? [...remaining, name] : remaining
        writeParam(params, FlagFilterParam.HIDDEN_ENVIRONMENTS, next.join(LIST_SEPARATOR))
      })
    },
    [updateParams],
  )

  return {
    filters,
    setSearch,
    setSort,
    setStatuses,
    setActivity,
    toggleEnvironmentColumn,
  }
}
