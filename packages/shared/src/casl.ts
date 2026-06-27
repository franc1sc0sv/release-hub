import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const Action = {
  MANAGE: 'manage',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const

export type Action = (typeof Action)[keyof typeof Action]

export const Subject = {
  USER: 'User',
  ALL: 'all',
} as const

export type Subject = (typeof Subject)[keyof typeof Subject]

export type AppAbility = MongoAbility<[Action, Subject]>

export function defineAbilityFor(role: UserRole): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (role === UserRole.ADMIN) {
    can(Action.MANAGE, Subject.ALL)
  }

  if (role === UserRole.USER) {
    can(Action.READ, Subject.USER)
  }

  return build()
}
