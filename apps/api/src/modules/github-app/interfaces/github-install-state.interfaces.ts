export interface IGithubInstallState {
  id: string
  nonce: string
  organizationId: string
  projectId: string | null
  expiresAt: Date
  consumedAt: Date | null
}

export interface ICreateGithubInstallStateData {
  nonce: string
  organizationId: string
  projectId: string | null
  expiresAt: Date
}

export interface IGithubInstallStatePayload {
  orgId: string
  projectId: string | null
  nonce: string
  purpose: string
}
