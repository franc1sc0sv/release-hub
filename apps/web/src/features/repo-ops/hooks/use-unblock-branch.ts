import { useMutation } from '@apollo/client/react'
import { UNBLOCK_BRANCH } from '../graphql/repo-ops.mutations'

export function useUnblockBranch() {
  const [unblockBranch, { loading }] = useMutation(UNBLOCK_BRANCH, {
    refetchQueries: ['GetBranchCleanupPage'],
    awaitRefetchQueries: false,
  })

  return { unblockBranch, loading }
}
