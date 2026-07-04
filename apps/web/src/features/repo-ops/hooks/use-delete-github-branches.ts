import { useMutation } from '@apollo/client/react'
import { DELETE_GITHUB_BRANCHES } from '../graphql/repo-ops.mutations'

export function useDeleteGithubBranches() {
  const [deleteGithubBranches, { loading }] = useMutation(DELETE_GITHUB_BRANCHES)

  return { deleteGithubBranches, loading }
}
