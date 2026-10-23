import { useMutation, useQuery } from '@apollo/client/react'
import type { BranchUpdateMethod } from '@/generated/graphql'
import {
  GET_PROJECT_RELEASE_BRANCHES,
  UPDATE_PROJECT_RELEASE_BRANCHES,
} from '../graphql/settings.operations'

export function useReleaseBranches(projectId: string) {
  const { data, loading } = useQuery(GET_PROJECT_RELEASE_BRANCHES, {
    variables: { id: projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [updateProject, { loading: saving }] = useMutation(UPDATE_PROJECT_RELEASE_BRANCHES)

  function saveReleaseBranches(branchUpdateMethod: BranchUpdateMethod, defaultParentBranch: string) {
    return updateProject({
      variables: { input: {
          id: projectId,
          branchUpdateMethod,
          defaultParentBranch,
          name: undefined,
          repo: undefined,
          conflictEnvironments: undefined,
          flagReminderIntervalDays: undefined,
        },
      },
    })
  }

  return {
    branchUpdateMethod: data?.getProject.branchUpdateMethod,
    defaultParentBranch: data?.getProject.defaultParentBranch,
    loading,
    saving,
    saveReleaseBranches,
  }
}
