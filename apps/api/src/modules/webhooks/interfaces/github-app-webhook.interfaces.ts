import type {
  IGithubDeploymentWebhookDeployment,
  IGithubDeploymentWebhookStatus,
} from '../../release/interfaces/github-deployment-webhook.interfaces'
import type {
  IGithubPushCommit,
  IGithubWebhookInstallationRef,
  IGithubWebhookPullRequest,
  IGithubWebhookRepositoryRef,
} from '../../repo-ops/interfaces/github-webhook.interfaces'

export interface IGithubAppWebhookPayload {
  action?: string
  ref?: string
  ref_type?: string
  before?: string
  after?: string
  number?: number
  commits?: IGithubPushCommit[]
  pull_request?: IGithubWebhookPullRequest
  deployment?: IGithubDeploymentWebhookDeployment
  deployment_status?: IGithubDeploymentWebhookStatus
  repository?: IGithubWebhookRepositoryRef
  installation?: IGithubWebhookInstallationRef
}
