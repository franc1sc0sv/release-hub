import { useQuery } from '@apollo/client/react'
import { GET_FLAGS } from '../graphql/flags.queries'
import type { FlagActivityFilter, FlagDeploymentStatus, FlagSortField, SortDirection } from '@/generated/graphql'

interface UseFlagsParams {
  projectId: string | null
  search?: string
  sortField?: FlagSortField
  sortEnvironment?: string
  sortDirection?: SortDirection
  statuses?: FlagDeploymentStatus[]
  activity?: FlagActivityFilter
  limit?: number
  offset?: number
}

export function useFlags({
  projectId,
  search,
  sortField,
  sortEnvironment,
  sortDirection,
  statuses,
  activity,
  limit = 100,
  offset = 0,
}: UseFlagsParams) {
  const { data, previousData, loading, error, refetch } = useQuery(GET_FLAGS, {
    variables: {
      input: {
        projectId: projectId ?? '',
        search,
        sortField,
        sortEnvironment,
        sortDirection,
        activity,
        statuses: statuses && statuses.length > 0 ? statuses : undefined,
        limit,
        offset,
      },
    },
    skip: !projectId,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  })

  const resolvedData = data ?? previousData
  const hasData = resolvedData !== undefined

  return {
    environments: resolvedData?.getFlags.environments ?? [],
    items: resolvedData?.getFlags.items ?? [],
    totalCount: resolvedData?.getFlags.totalCount ?? 0,
    lastSyncedAt: resolvedData?.getFlags.lastSyncedAt ?? null,
    loading: loading && !hasData,
    isRefetching: loading && hasData,
    error: error ?? null,
    refetch,
  }
}
