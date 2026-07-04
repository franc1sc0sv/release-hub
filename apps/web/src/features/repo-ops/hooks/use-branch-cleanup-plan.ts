import { useQuery } from '@apollo/client/react'
import { GET_BRANCH_CLEANUP_PLAN } from '../graphql/repo-ops.queries'

export function useBranchCleanupPlan(projectId: string, open: boolean) {
  const { data, loading, error } = useQuery(GET_BRANCH_CLEANUP_PLAN, {
    variables: { projectId },
    skip: !open,
    fetchPolicy: 'network-only',
  })

  return {
    plan: data?.branchCleanupPlan ?? null,
    loading,
    error: error ?? null,
  }
}
