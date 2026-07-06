export interface ILinearOAuthState {
  id: string
  nonce: string
  userId: string
  projectId: string
  expiresAt: Date
  consumedAt: Date | null
}

export interface ICreateLinearOAuthStateData {
  nonce: string
  userId: string
  projectId: string
  expiresAt: Date
}
