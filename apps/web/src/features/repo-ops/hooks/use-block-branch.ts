import { useMutation } from '@apollo/client/react'
import { BLOCK_BRANCH } from '../graphql/repo-ops.mutations'

export function useBlockBranch() {
  const [blockBranch, { loading }] = useMutation(BLOCK_BRANCH, {
    refetchQueries: ['GetBranchCleanupPage'],
    awaitRefetchQueries: false,
  })

  return { blockBranch, loading }
}
