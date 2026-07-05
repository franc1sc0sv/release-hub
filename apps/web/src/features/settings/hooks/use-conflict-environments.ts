import { useMutation, useQuery } from '@apollo/client/react'
import {
  FLAGSMITH_ENVIRONMENTS,
  GET_PROJECT_CONFLICT_ENVIRONMENTS,
  UPDATE_PROJECT_CONFLICT_ENVIRONMENTS,
} from '../graphql/settings.operations'

export function useConflictEnvironments(projectId: string) {
  const { data: environmentsData, loading: loadingEnvironments } = useQuery(
    FLAGSMITH_ENVIRONMENTS,
    {
      variables: { projectId },
      skip: !projectId,
    },
  )

  const { data: projectData, loading: loadingProject } = useQuery(
    GET_PROJECT_CONFLICT_ENVIRONMENTS,
    {
      variables: { id: projectId },
      skip: !projectId,
      fetchPolicy: 'cache-and-network',
    },
  )

  const [updateProject, { loading: saving }] = useMutation(UPDATE_PROJECT_CONFLICT_ENVIRONMENTS)

  function saveConflictEnvironments(environments: string[]) {
    return updateProject({
      variables: {
        input: {
          id: projectId,
          conflictEnvironments: environments,
          name: undefined,
          repo: undefined,
          flagReminderIntervalDays: undefined,
        },
      },
    })
  }

  return {
    environments: environmentsData?.flagsmithEnvironments ?? [],
    conflictEnvironments: projectData?.getProject.conflictEnvironments,
    loading: loadingEnvironments || loadingProject,
    saving,
    saveConflictEnvironments,
  }
}
