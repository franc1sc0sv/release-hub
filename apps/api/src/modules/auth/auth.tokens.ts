import { randomUUID } from 'node:crypto'
import type { JwtService } from '@nestjs/jwt'
import type { TxClient } from '@release-hub/db'
import type { UserRole } from '@release-hub/shared'
import type { IAuthRepository } from './repositories/auth.repository.abstract'
import { TokenType } from './interfaces/auth.interfaces'
import type { IAuthTokens } from './interfaces/auth.interfaces'

const ACCESS_TOKEN_TTL = '1d'
const REFRESH_TOKEN_TTL_DAYS = 7

interface ITokenSubject {
  id: string
  email: string
  role: UserRole
}

export async function issueTokens(
  jwtService: JwtService,
  authRepository: IAuthRepository,
  tx: TxClient,
  user: ITokenSubject,
): Promise<IAuthTokens> {
  const jti = randomUUID()

  const accessToken = jwtService.sign(
    { sub: user.id, email: user.email, role: user.role, type: TokenType.ACCESS },
    { expiresIn: ACCESS_TOKEN_TTL },
  )

  const refreshToken = jwtService.sign(
    { sub: user.id, email: user.email, role: user.role, type: TokenType.REFRESH, jti },
    { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` },
  )

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
  await authRepository.createRefreshToken({ id: jti, userId: user.id, expiresAt }, tx)

  return { accessToken, refreshToken }
}
