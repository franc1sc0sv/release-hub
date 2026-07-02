import { useQuery } from '@apollo/client/react'
import { GET_BLOCKED_BRANCHES } from '../graphql/repo-ops.queries'

export function useBlockedBranches(projectId: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_BLOCKED_BRANCHES, {
    variables: { projectId: projectId ?? '' },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  })

  return {
    blockedBranches: data?.blockedBranches ?? [],
    loading,
    error: error ?? null,
    refetch,
  }
}
