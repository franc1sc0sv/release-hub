import { PrismaClient } from './generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg(process.env.DATABASE_URL!)

export const prisma = new PrismaClient({ adapter })

export type TxClient = Parameters<Extract<Parameters<PrismaClient['$transaction']>[0], (...args: any[]) => any>>[0]
