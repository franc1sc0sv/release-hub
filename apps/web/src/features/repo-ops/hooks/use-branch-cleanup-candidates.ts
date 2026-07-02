import { useQuery } from '@apollo/client/react'
import { GET_BRANCH_CLEANUP_CANDIDATES } from '../graphql/repo-ops.queries'

export function useBranchCleanupCandidates(projectId: string | null) {
  const { data, loading, error, refetch } = useQuery(GET_BRANCH_CLEANUP_CANDIDATES, {
    variables: { projectId: projectId ?? '' },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  })

  return {
    candidates: data?.branchCleanupCandidates ?? [],
    loading,
    error: error ?? null,
    refetch,
  }
}
