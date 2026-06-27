import type { UserRole } from '@release-hub/shared'

export interface ILoginData {
  email: string
  password: string
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ITokenPayload {
  sub: string
  email: string
  role: UserRole
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
