import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  InferSubjects,
} from '@casl/ability'

export const ProjectRole = {
  OWNER: 'owner',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole]

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
  PROJECT: 'Project',
  RELEASE: 'Release',
  FEATURE: 'Feature',
  PULL_REQUEST: 'PullRequest',
  MEMBERSHIP: 'Membership',
  INVITATION: 'Invitation',
  ALL: 'all',
} as const

export type Subject = (typeof Subject)[keyof typeof Subject]

export interface IUserSubject {
  __type: 'User'
}

export interface IProjectSubject {
  __type: 'Project'
  projectId: string
}

export interface IReleaseSubject {
  __type: 'Release'
  projectId: string
}

export interface IFeatureSubject {
  __type: 'Feature'
  projectId: string
}

export interface IPullRequestSubject {
  __type: 'PullRequest'
  projectId: string
}

export interface IMembershipSubject {
  __type: 'Membership'
  projectId: string
}

export interface IInvitationSubject {
  __type: 'Invitation'
  projectId: string
}

type SubjectTypes = InferSubjects<
  | ({ kind: 'User' } & IUserSubject)
  | ({ kind: 'Project' } & IProjectSubject)
  | ({ kind: 'Release' } & IReleaseSubject)
  | ({ kind: 'Feature' } & IFeatureSubject)
  | ({ kind: 'PullRequest' } & IPullRequestSubject)
  | ({ kind: 'Membership' } & IMembershipSubject)
  | ({ kind: 'Invitation' } & IInvitationSubject)
>

export type AppAbility = MongoAbility<[Action, SubjectTypes | 'all']>

export interface IProjectMembership {
  projectId: string
  role: ProjectRole
}

const buildAbility = (builder: AbilityBuilder<AppAbility>): AppAbility =>
  builder.build({ detectSubjectType: (subject) => subject.kind })

export function defineGateAbility(): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility)
  const { can } = builder

  can(Action.READ, 'User')
  can(Action.UPDATE, 'User')
  can(Action.MANAGE, 'Project')
  can(Action.MANAGE, 'Release')
  can(Action.MANAGE, 'Feature')
  can(Action.MANAGE, 'PullRequest')
  can(Action.MANAGE, 'Membership')
  can(Action.MANAGE, 'Invitation')

  return buildAbility(builder)
}

export function defineAbilityFor(memberships: IProjectMembership[] = []): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility)
  const { can } = builder

  can(Action.READ, 'User')
  can(Action.UPDATE, 'Invitation')

  for (const membership of memberships) {
    const { projectId, role: projectRole } = membership

    if (projectRole === ProjectRole.OWNER) {
      can(Action.MANAGE, 'Project', { projectId })
      can(Action.MANAGE, 'Release', { projectId })
      can(Action.MANAGE, 'Feature', { projectId })
      can(Action.MANAGE, 'PullRequest', { projectId })
      can(Action.MANAGE, 'Membership', { projectId })
      can(Action.MANAGE, 'Invitation', { projectId })
    }

    if (projectRole === ProjectRole.MEMBER) {
      can(Action.READ, 'Project', { projectId })
      can(Action.CREATE, 'Release', { projectId })
      can(Action.READ, 'Release', { projectId })
      can(Action.UPDATE, 'Release', { projectId })
      can(Action.DELETE, 'Release', { projectId })
      can(Action.CREATE, 'Feature', { projectId })
      can(Action.READ, 'Feature', { projectId })
      can(Action.UPDATE, 'Feature', { projectId })
      can(Action.READ, 'PullRequest', { projectId })
      can(Action.UPDATE, 'PullRequest', { projectId })
      can(Action.READ, 'Membership', { projectId })
      can(Action.READ, 'Invitation', { projectId })
    }

    if (projectRole === ProjectRole.VIEWER) {
      can(Action.READ, 'Project', { projectId })
      can(Action.READ, 'Release', { projectId })
      can(Action.READ, 'Feature', { projectId })
      can(Action.READ, 'PullRequest', { projectId })
      can(Action.READ, 'Membership', { projectId })
    }
  }

  return buildAbility(builder)
}
