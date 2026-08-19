import { useQuery } from '@apollo/client/react'
import { GET_FLAGS } from '../graphql/flags.queries'

interface UseFlagsParams {
  projectId: string | null
}

export function useFlags({ projectId }: UseFlagsParams) {
  const { data, loading, error, refetch } = useQuery(GET_FLAGS, {
    variables: {
      input: {
        projectId: projectId ?? '',
        search: undefined,
        sortField: undefined,
        sortDirection: undefined,
        sortEnvironment: undefined,
        statuses: undefined,
        activity: undefined,
        limit: undefined,
        offset: undefined,
      },
    },
    skip: !projectId,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  })

  return {
    environments: data?.getFlags.environments ?? [],
    items: data?.getFlags.items ?? [],
    lastSyncedAt: data?.getFlags.lastSyncedAt ?? null,
    loading,
    error: error ?? null,
    refetch,
  }
}
