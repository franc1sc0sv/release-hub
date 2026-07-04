import { useQuery } from '@apollo/client/react'
import { GET_FLAG_DETAIL } from '../graphql/flags.queries'

export function useFlagDetail(projectId: string, flagKey: string) {
  const { data, loading, error } = useQuery(GET_FLAG_DETAIL, {
    variables: { projectId, key: flagKey },
    skip: !projectId || !flagKey,
    fetchPolicy: 'cache-and-network',
  })

  return {
    flagDetail: data?.flagDetail ?? null,
    loading,
    error: error ?? null,
  }
}
