export interface IGithubWebhookRepositoryRef {
  full_name: string
}

export interface IGithubWebhookInstallationRef {
  id: number
}

export interface IGithubPushCommit {
  id: string
  message: string
}

export interface IGithubWebhookPullRequestRef {
  ref: string
}

export interface IGithubWebhookPullRequest {
  number: number
  title: string
  state: string
  merged: boolean
  head: IGithubWebhookPullRequestRef
  base: IGithubWebhookPullRequestRef
}

export interface IGithubPushWebhookPayload {
  ref?: string
  before?: string
  after?: string
  commits?: IGithubPushCommit[]
  repository?: IGithubWebhookRepositoryRef
  installation?: IGithubWebhookInstallationRef
}

export interface IGithubRefWebhookPayload {
  ref?: string
  ref_type?: string
  repository?: IGithubWebhookRepositoryRef
  installation?: IGithubWebhookInstallationRef
}

export interface IGithubPullRequestWebhookPayload {
  action?: string
  number?: number
  pull_request?: IGithubWebhookPullRequest
  repository?: IGithubWebhookRepositoryRef
  installation?: IGithubWebhookInstallationRef
}
