import { registerEnumType } from '@nestjs/graphql'

export const DigestFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const

export type DigestFrequency = (typeof DigestFrequency)[keyof typeof DigestFrequency]

registerEnumType(DigestFrequency, { name: 'DigestFrequency' })
