import { registerEnumType } from '@nestjs/graphql'

export const LinearSyncActionKind = {
  MOVE_TO_PRODUCTION: 'move_to_production',
  FLAG_LABEL: 'flag_label',
} as const

export type LinearSyncActionKind = (typeof LinearSyncActionKind)[keyof typeof LinearSyncActionKind]

registerEnumType(LinearSyncActionKind, { name: 'LinearSyncActionKind' })
