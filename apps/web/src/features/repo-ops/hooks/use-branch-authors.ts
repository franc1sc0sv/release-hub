import { useQuery } from '@apollo/client/react'
import { GET_BRANCH_AUTHORS } from '../graphql/repo-ops.queries'

export function useBranchAuthors(projectId: string | null) {
  const { data, loading } = useQuery(GET_BRANCH_AUTHORS, {
    variables: { projectId: projectId ?? '' },
    skip: !projectId,
  })

  return {
    authors: data?.branchAuthors ?? [],
    loading,
  }
}
