import { useQuery } from '@apollo/client/react'
import { GET_FLAGS } from '../graphql/flags.queries'
import type { FlagSortField, SortDirection } from '@/generated/graphql'

interface UseFlagsParams {
  projectId: string | null
  search?: string
  sortField?: FlagSortField
  sortEnvironment?: string
  sortDirection?: SortDirection
  limit?: number
  offset?: number
}

export function useFlags({
  projectId,
  search,
  sortField,
  sortEnvironment,
  sortDirection,
  limit = 100,
  offset = 0,
}: UseFlagsParams) {
  const { data, loading, error, refetch } = useQuery(GET_FLAGS, {
    variables: {
      input: {
        projectId: projectId ?? '',
        search,
        sortField,
        sortEnvironment,
        sortDirection,
        limit,
        offset,
      },
    },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  })

  return {
    environments: data?.getFlags.environments ?? [],
    items: data?.getFlags.items ?? [],
    totalCount: data?.getFlags.totalCount ?? 0,
    loading,
    error: error ?? null,
    refetch,
  }
}
