export interface IGithubConnection {
  id: string
  userId: string
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  githubUserId: string
  githubLogin: string
  scopes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IUpsertGithubConnectionData {
  userId: string
  encryptedAccessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  githubUserId: string
  githubLogin: string
  scopes: string | null
}
