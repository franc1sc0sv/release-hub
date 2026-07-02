import { useMutation } from '@apollo/client/react'
import { UNBLOCK_BRANCH } from '../graphql/repo-ops.mutations'
import { GET_BLOCKED_BRANCHES, GET_BRANCH_CLEANUP_CANDIDATES } from '../graphql/repo-ops.queries'

export function useUnblockBranch(projectId: string) {
  const [unblockBranch, { loading }] = useMutation(UNBLOCK_BRANCH, {
    refetchQueries: [
      { query: GET_BLOCKED_BRANCHES, variables: { projectId } },
      { query: GET_BRANCH_CLEANUP_CANDIDATES, variables: { projectId } },
    ],
    awaitRefetchQueries: true,
  })

  return { unblockBranch, loading }
}
