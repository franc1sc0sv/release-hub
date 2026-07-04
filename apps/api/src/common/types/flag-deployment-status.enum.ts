import { registerEnumType } from '@nestjs/graphql'

export const FlagDeploymentStatus = {
  SHIPPED_ON: 'shipped_on',
  SHIPPED_OFF: 'shipped_off',
  IN_PROGRESS: 'in_progress',
  CONFLICT: 'conflict',
  UNTRACKED: 'untracked',
} as const

export type FlagDeploymentStatus = (typeof FlagDeploymentStatus)[keyof typeof FlagDeploymentStatus]

registerEnumType(FlagDeploymentStatus, { name: 'FlagDeploymentStatus' })
