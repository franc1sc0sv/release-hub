import { useMutation, useQuery } from '@apollo/client/react'
import { GET_PROJECT_FLAG_REMINDER, UPDATE_PROJECT_FLAG_REMINDER } from '../graphql/settings.operations'

export function useFlagReminderInterval(projectId: string) {
  const { data, loading } = useQuery(GET_PROJECT_FLAG_REMINDER, {
    variables: { id: projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [updateProject, { loading: saving }] = useMutation(UPDATE_PROJECT_FLAG_REMINDER)

  function saveReminderInterval(days: number) {
    return updateProject({
      variables: {
        input: { id: projectId, flagReminderIntervalDays: days, name: undefined, repo: undefined },
      },
    })
  }

  return {
    flagReminderIntervalDays: data?.getProject.flagReminderIntervalDays,
    loading,
    saving,
    saveReminderInterval,
  }
}
