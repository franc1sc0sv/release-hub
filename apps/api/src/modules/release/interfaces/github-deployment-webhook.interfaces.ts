export interface IGithubDeploymentWebhookDeployment {
  id: number
  ref: string
  sha: string
}

export interface IGithubDeploymentWebhookStatus {
  state: string
  environment: string
}

export interface IGithubDeploymentWebhookRepository {
  full_name: string
}

export interface IGithubDeploymentStatusWebhookPayload {
  action: string
  deployment: IGithubDeploymentWebhookDeployment
  deployment_status: IGithubDeploymentWebhookStatus
  repository: IGithubDeploymentWebhookRepository
}

export interface IParsedGithubDeploymentWebhookEvent {
  githubDeploymentId: string
  ref: string
  sha: string
  environment: string
  state: string
  repoFullName: string
}
