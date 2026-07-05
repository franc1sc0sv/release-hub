import type { IGithubRefWebhookPayload } from '../../interfaces/github-webhook.interfaces'

export const GithubRefAction = {
  CREATED: 'created',
  DELETED: 'deleted',
} as const

export type GithubRefActionValue = (typeof GithubRefAction)[keyof typeof GithubRefAction]

export class HandleGithubRefWebhookCommand {
  constructor(
    readonly projectId: string,
    readonly action: GithubRefActionValue,
    readonly payload: IGithubRefWebhookPayload,
  ) {}
}
