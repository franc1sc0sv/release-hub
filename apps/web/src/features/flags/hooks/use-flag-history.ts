import { useQuery } from '@apollo/client/react'
import { GET_FLAG_HISTORY } from '../graphql/flags.queries'

interface UseFlagHistoryParams {
  projectId: string
  flagKey: string
  limit: number
  offset: number
}

export function useFlagHistory({ projectId, flagKey, limit, offset }: UseFlagHistoryParams) {
  const { data, loading, error } = useQuery(GET_FLAG_HISTORY, {
    variables: { input: { projectId, flagKey, limit, offset } },
    skip: !projectId || !flagKey,
    fetchPolicy: 'cache-and-network',
  })

  return {
    items: data?.flagHistory.items ?? [],
    totalCount: data?.flagHistory.totalCount ?? 0,
    loading,
    error: error ?? null,
  }
}
