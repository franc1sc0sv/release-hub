import type { IGithubPullRequestWebhookPayload } from '../../interfaces/github-webhook.interfaces'

export class HandleGithubPullRequestWebhookCommand {
  constructor(
    readonly projectId: string,
    readonly payload: IGithubPullRequestWebhookPayload,
  ) {}
}
