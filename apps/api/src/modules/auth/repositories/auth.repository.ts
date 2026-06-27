import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IAuthRepository } from './auth.repository.abstract'
import type { IAuthUser, IAuthUserWithPassword } from '../interfaces/auth.interfaces'
import type { ICreateLoginCodeData, ILoginCode } from '../interfaces/login-code.interfaces'

@Injectable()
export class AuthRepository extends IAuthRepository {
  findByEmail = async (email: string, tx: TxClient): Promise<IAuthUserWithPassword | null> => {
    return tx.user.findFirst({
      where: { email, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        password: true,
      },
    })
  }

  findById = async (id: string, tx: TxClient): Promise<IAuthUser | null> => {
    return tx.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
      },
    })
  }

  createLoginCode = async (data: ICreateLoginCodeData, tx: TxClient): Promise<ILoginCode> => {
    return tx.loginCode.create({ data })
  }

  findActiveLoginCode = async (userId: string, tx: TxClient): Promise<ILoginCode | null> => {
    return tx.loginCode.findFirst({
      where: {
        userId,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  countRecentCodes = async (userId: string, sinceMinutes: number, tx: TxClient): Promise<number> => {
    return tx.loginCode.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - sinceMinutes * 60_000) },
      },
    })
  }

  consumeLoginCode = async (id: string, tx: TxClient): Promise<void> => {
    await tx.loginCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    })
  }

  incrementAttempts = async (id: string, tx: TxClient): Promise<number> => {
    const row = await tx.loginCode.update({
      where: { id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    })
    return row.attempts
  }

  findLastCodeCreatedAt = async (userId: string, tx: TxClient): Promise<Date | null> => {
    const row = await tx.loginCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })
    return row?.createdAt ?? null
  }
}
