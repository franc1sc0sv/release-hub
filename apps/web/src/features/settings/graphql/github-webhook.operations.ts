import { graphql } from '@/generated/gql'

export const GITHUB_WEBHOOK_SETTINGS = graphql(`
  query GithubWebhookSettings($projectId: ID!) {
    getConnectionSettings(projectId: $projectId) {
      githubWebhookPath
      githubWebhookSecretSet
    }
  }
`)

export const ROTATE_GITHUB_WEBHOOK_SECRET = graphql(`
  mutation RotateGithubWebhookSecret($projectId: ID!) {
    rotateGithubWebhookSecret(projectId: $projectId) {
      githubWebhookPath
      githubWebhookSecretSet
    }
  }
`)
