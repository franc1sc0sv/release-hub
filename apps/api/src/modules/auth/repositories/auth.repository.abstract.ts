import type { IBaseRepository, RepositoryMethod } from '../../../common/cqrs'
import type { IAuthUser, IAuthUserWithPassword, ICreateUserData } from '../interfaces/auth.interfaces'
import type {
  ICreateRefreshTokenData,
  IRefreshTokenRecord,
} from '../interfaces/auth.interfaces'
import type { ICreateLoginCodeData, ILoginCode } from '../interfaces/login-code.interfaces'

export abstract class IAuthRepository implements IBaseRepository<IAuthUser> {
  abstract findByEmail: RepositoryMethod<[email: string], IAuthUserWithPassword | null>
  abstract createUser: RepositoryMethod<[data: ICreateUserData], IAuthUserWithPassword>
  abstract findById: RepositoryMethod<[id: string], IAuthUser | null>
  abstract createLoginCode: RepositoryMethod<[data: ICreateLoginCodeData], ILoginCode>
  abstract findActiveLoginCode: RepositoryMethod<[userId: string], ILoginCode | null>
  abstract countRecentCodes: RepositoryMethod<[userId: string, sinceMinutes: number], number>
  abstract consumeLoginCode: RepositoryMethod<[id: string], void>
  abstract reserveLoginCodeAttempt: RepositoryMethod<[id: string, maxAttempts: number], boolean>
  abstract findLastCodeCreatedAt: RepositoryMethod<[userId: string], Date | null>
  abstract createRefreshToken: RepositoryMethod<[data: ICreateRefreshTokenData], void>
  abstract findRefreshTokenById: RepositoryMethod<[id: string], IRefreshTokenRecord | null>
  abstract revokeRefreshToken: RepositoryMethod<[id: string], void>
}
