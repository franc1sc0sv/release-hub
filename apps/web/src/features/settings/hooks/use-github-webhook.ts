import { useMutation, useQuery } from '@apollo/client/react'
import {
  GITHUB_WEBHOOK_SETTINGS,
  ROTATE_GITHUB_WEBHOOK_SECRET,
} from '../graphql/github-webhook.operations'

export function useGithubWebhook(projectId: string) {
  const { data, loading } = useQuery(GITHUB_WEBHOOK_SETTINGS, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [rotateSecret, { loading: rotating }] = useMutation(ROTATE_GITHUB_WEBHOOK_SECRET, {
    variables: { projectId },
    refetchQueries: [{ query: GITHUB_WEBHOOK_SETTINGS, variables: { projectId } }],
  })

  return {
    webhookPath: data?.getConnectionSettings.githubWebhookPath ?? null,
    secretSet: data?.getConnectionSettings.githubWebhookSecretSet ?? false,
    loading,
    rotating,
    rotateSecret: () => rotateSecret(),
  }
}
