import type { UserRole } from '@release-hub/shared'

export interface ILoginData {
  email: string
  password: string
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}

export const TokenType = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const

export type TokenType = (typeof TokenType)[keyof typeof TokenType]

export interface ITokenPayload {
  sub: string
  email: string
  role: UserRole
  type: TokenType
  jti?: string
}

export interface IAuthUser {
  id: string
  email: string
  role: UserRole
  name: string
  avatarUrl: string | null
}

export interface IAuthUserWithPassword extends IAuthUser {
  password: string
}

export interface IRefreshTokenRecord {
  id: string
  userId: string
  expiresAt: Date
  revokedAt: Date | null
}

export interface ICreateRefreshTokenData {
  id: string
  userId: string
  expiresAt: Date
}
