import { useMutation } from '@apollo/client/react'
import { BLOCK_BRANCH } from '../graphql/repo-ops.mutations'
import { GET_BLOCKED_BRANCHES, GET_BRANCH_CLEANUP_CANDIDATES } from '../graphql/repo-ops.queries'

export function useBlockBranch(projectId: string) {
  const [blockBranch, { loading }] = useMutation(BLOCK_BRANCH, {
    refetchQueries: [
      { query: GET_BLOCKED_BRANCHES, variables: { projectId } },
      { query: GET_BRANCH_CLEANUP_CANDIDATES, variables: { projectId } },
    ],
    awaitRefetchQueries: true,
  })

  return { blockBranch, loading }
}
