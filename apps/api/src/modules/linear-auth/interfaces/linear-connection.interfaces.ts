export interface IProjectLinearConnection {
  id: string
  projectId: string
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  linearUserId: string
  linearUserName: string
  scopes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IUpsertProjectLinearConnectionData {
  projectId: string
  encryptedAccessToken: string
  encryptedRefreshToken: string | null
  expiresAt: Date | null
  linearUserId: string
  linearUserName: string
  scopes: string | null
}
