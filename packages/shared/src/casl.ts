import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  InferSubjects,
} from '@casl/ability'

export const OrgRole = {
  OWNER: 'owner',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const

export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole]

export const ProjectRole = OrgRole

export type ProjectRole = OrgRole

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
  ORGANIZATION: 'Organization',
  PROJECT: 'Project',
  RELEASE: 'Release',
  FEATURE: 'Feature',
  PULL_REQUEST: 'PullRequest',
  MEMBERSHIP: 'Membership',
  INVITATION: 'Invitation',
  SUMMARY_PROFILE: 'SummaryProfile',
  ALL: 'all',
} as const

export type Subject = (typeof Subject)[keyof typeof Subject]

export interface IUserSubject {
  __type: 'User'
}

export interface IOrganizationSubject {
  __type: 'Organization'
  organizationId: string
}

export interface IProjectSubject {
  __type: 'Project'
  organizationId: string
}

export interface IReleaseSubject {
  __type: 'Release'
  organizationId: string
}

export interface IFeatureSubject {
  __type: 'Feature'
  organizationId: string
}

export interface IPullRequestSubject {
  __type: 'PullRequest'
  organizationId: string
}

export interface IMembershipSubject {
  __type: 'Membership'
  organizationId: string
}

export interface IInvitationSubject {
  __type: 'Invitation'
  organizationId: string
}

export interface ISummaryProfileSubject {
  __type: 'SummaryProfile'
  organizationId: string
}

type SubjectTypes = InferSubjects<
  | ({ kind: 'User' } & IUserSubject)
  | ({ kind: 'Organization' } & IOrganizationSubject)
  | ({ kind: 'Project' } & IProjectSubject)
  | ({ kind: 'Release' } & IReleaseSubject)
  | ({ kind: 'Feature' } & IFeatureSubject)
  | ({ kind: 'PullRequest' } & IPullRequestSubject)
  | ({ kind: 'Membership' } & IMembershipSubject)
  | ({ kind: 'Invitation' } & IInvitationSubject)
  | ({ kind: 'SummaryProfile' } & ISummaryProfileSubject)
>

export type AppAbility = MongoAbility<[Action, SubjectTypes | 'all']>

export interface IOrgMembership {
  organizationId: string
  role: OrgRole
}

export type IProjectMembership = IOrgMembership

const buildAbility = (builder: AbilityBuilder<AppAbility>): AppAbility =>
  builder.build({ detectSubjectType: (subject) => subject.kind })

export function defineGateAbility(): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility)
  const { can } = builder

  can(Action.READ, 'User')
  can(Action.UPDATE, 'User')
  can(Action.MANAGE, 'Organization')
  can(Action.MANAGE, 'Project')
  can(Action.MANAGE, 'Release')
  can(Action.MANAGE, 'Feature')
  can(Action.MANAGE, 'PullRequest')
  can(Action.MANAGE, 'Membership')
  can(Action.MANAGE, 'Invitation')
  can(Action.MANAGE, 'SummaryProfile')

  return buildAbility(builder)
}

export function defineAbilityFor(memberships: IOrgMembership[] = []): AppAbility {
  const builder = new AbilityBuilder<AppAbility>(createMongoAbility)
  const { can } = builder

  can(Action.READ, 'User')
  can(Action.UPDATE, 'Invitation')

  for (const membership of memberships) {
    const { organizationId, role } = membership

    if (role === OrgRole.OWNER) {
      can(Action.MANAGE, 'Organization', { organizationId })
      can(Action.MANAGE, 'Project', { organizationId })
      can(Action.MANAGE, 'Release', { organizationId })
      can(Action.MANAGE, 'Feature', { organizationId })
      can(Action.MANAGE, 'PullRequest', { organizationId })
      can(Action.MANAGE, 'Membership', { organizationId })
      can(Action.MANAGE, 'Invitation', { organizationId })
      can(Action.MANAGE, 'SummaryProfile', { organizationId })
    }

    if (role === OrgRole.MEMBER) {
      can(Action.READ, 'Organization', { organizationId })
      can(Action.READ, 'Project', { organizationId })
      can(Action.CREATE, 'Release', { organizationId })
      can(Action.READ, 'Release', { organizationId })
      can(Action.UPDATE, 'Release', { organizationId })
      can(Action.DELETE, 'Release', { organizationId })
      can(Action.CREATE, 'Feature', { organizationId })
      can(Action.READ, 'Feature', { organizationId })
      can(Action.UPDATE, 'Feature', { organizationId })
      can(Action.DELETE, 'Feature', { organizationId })
      can(Action.READ, 'PullRequest', { organizationId })
      can(Action.UPDATE, 'PullRequest', { organizationId })
      can(Action.READ, 'Membership', { organizationId })
      can(Action.READ, 'Invitation', { organizationId })
      can(Action.CREATE, 'SummaryProfile', { organizationId })
      can(Action.READ, 'SummaryProfile', { organizationId })
      can(Action.UPDATE, 'SummaryProfile', { organizationId })
      can(Action.DELETE, 'SummaryProfile', { organizationId })
    }

    if (role === OrgRole.VIEWER) {
      can(Action.READ, 'Organization', { organizationId })
      can(Action.READ, 'Project', { organizationId })
      can(Action.READ, 'Release', { organizationId })
      can(Action.READ, 'Feature', { organizationId })
      can(Action.READ, 'PullRequest', { organizationId })
      can(Action.READ, 'Membership', { organizationId })
      can(Action.READ, 'SummaryProfile', { organizationId })
    }
  }

  return buildAbility(builder)
}
