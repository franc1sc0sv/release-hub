import type { IBaseRepository, RepositoryMethod } from '../../../common/cqrs'
import type { IAuthUser, IAuthUserWithPassword } from '../interfaces/auth.interfaces'
import type { ICreateLoginCodeData, ILoginCode } from '../interfaces/login-code.interfaces'

export abstract class IAuthRepository implements IBaseRepository<IAuthUser> {
  abstract findByEmail: RepositoryMethod<[email: string], IAuthUserWithPassword | null>
  abstract findById: RepositoryMethod<[id: string], IAuthUser | null>
  abstract createLoginCode: RepositoryMethod<[data: ICreateLoginCodeData], ILoginCode>
  abstract findActiveLoginCode: RepositoryMethod<[userId: string], ILoginCode | null>
  abstract countRecentCodes: RepositoryMethod<[userId: string, sinceMinutes: number], number>
  abstract consumeLoginCode: RepositoryMethod<[id: string], void>
  abstract incrementAttempts: RepositoryMethod<[id: string], number>
  abstract findLastCodeCreatedAt: RepositoryMethod<[userId: string], Date | null>
}
