import { registerEnumType } from '@nestjs/graphql'
import { UserRole } from '@release-hub/shared'

const UserRoleGql = {
  [UserRole.ADMIN]: UserRole.ADMIN,
  [UserRole.USER]: UserRole.USER,
} as const

registerEnumType(UserRoleGql, { name: 'UserRole' })

export { UserRole, UserRoleGql }
