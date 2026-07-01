import { registerEnumType } from '@nestjs/graphql'

export const FlagReferenceKind = {
  DEFINITION: 'DEFINITION',
  USAGE: 'USAGE',
} as const

export type FlagReferenceKind = (typeof FlagReferenceKind)[keyof typeof FlagReferenceKind]

registerEnumType(FlagReferenceKind, { name: 'FlagReferenceKind' })
