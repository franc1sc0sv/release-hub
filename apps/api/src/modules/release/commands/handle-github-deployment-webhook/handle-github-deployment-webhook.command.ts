import type { IGithubDeploymentStatusWebhookPayload } from '../../interfaces/github-deployment-webhook.interfaces'

export class HandleGithubDeploymentWebhookCommand {
  constructor(
    public readonly projectId: string,
    public readonly payload: IGithubDeploymentStatusWebhookPayload,
  ) {}
}
