import type { IGithubPushWebhookPayload } from '../../interfaces/github-webhook.interfaces'

export class HandleGithubPushWebhookCommand {
  constructor(
    readonly projectId: string,
    readonly payload: IGithubPushWebhookPayload,
  ) {}
}
