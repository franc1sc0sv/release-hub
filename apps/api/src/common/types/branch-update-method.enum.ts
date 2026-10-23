import { registerEnumType } from '@nestjs/graphql'

export const BranchUpdateMethod = {
  REBASE: 'rebase',
  MERGE: 'merge',
} as const

export type BranchUpdateMethod = (typeof BranchUpdateMethod)[keyof typeof BranchUpdateMethod]

registerEnumType(BranchUpdateMethod, { name: 'BranchUpdateMethod' })
