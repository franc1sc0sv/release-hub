import { useMutation } from '@apollo/client/react'
import { DELETE_GITHUB_BRANCHES } from '../graphql/repo-ops.mutations'
import { GET_BRANCH_CLEANUP_CANDIDATES } from '../graphql/repo-ops.queries'

export function useDeleteGithubBranches(projectId: string) {
  const [deleteGithubBranches, { loading }] = useMutation(DELETE_GITHUB_BRANCHES, {
    refetchQueries: [{ query: GET_BRANCH_CLEANUP_CANDIDATES, variables: { projectId } }],
    awaitRefetchQueries: true,
  })

  return { deleteGithubBranches, loading }
}
