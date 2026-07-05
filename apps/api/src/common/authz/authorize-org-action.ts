import type { TxClient } from '@release-hub/db'
import {
  Action,
  Subject,
  defineAbilityFor,
  type IOrganizationSubject,
  type IProjectSubject,
  type IReleaseSubject,
  type IFeatureSubject,
  type IPullRequestSubject,
  type IMembershipSubject,
  type IInvitationSubject,
} from '@release-hub/shared'
import { ForbiddenException, NotFoundException } from '../errors'
import { IOrganizationRepository } from '../../modules/organization/interfaces/organization.repository'

type OrgScopedSubject =
  | ({ kind: 'Organization' } & IOrganizationSubject)
  | ({ kind: 'Project' } & IProjectSubject)
  | ({ kind: 'Release' } & IReleaseSubject)
  | ({ kind: 'Feature' } & IFeatureSubject)
  | ({ kind: 'PullRequest' } & IPullRequestSubject)
  | ({ kind: 'Membership' } & IMembershipSubject)
  | ({ kind: 'Invitation' } & IInvitationSubject)

interface IAuthorizeProjectActionParams {
  actorId: string
  projectId: string
  action: Action
  subjectKind: Subject
}

interface IAuthorizeOrgActionParams {
  actorId: string
  organizationId: string
  action: Action
  subjectKind: Subject
}

const buildSubject = (subjectKind: Subject, organizationId: string): OrgScopedSubject =>
  ({ kind: subjectKind, __type: subjectKind, organizationId }) as OrgScopedSubject

export async function authorizeProjectAction(
  orgRepository: IOrganizationRepository,
  params: IAuthorizeProjectActionParams,
  tx: TxClient,
): Promise<string> {
  const organizationId = await orgRepository.findOrganizationIdForProject(params.projectId, tx)

  if (!organizationId) {
    throw new NotFoundException('Project')
  }

  const memberships = await orgRepository.findOrgMembershipsForUser(params.actorId, tx)
  const ability = defineAbilityFor(memberships)

  if (!ability.can(params.action, buildSubject(params.subjectKind, organizationId))) {
    throw new ForbiddenException()
  }

  return organizationId
}

export async function authorizeOrgAction(
  orgRepository: IOrganizationRepository,
  params: IAuthorizeOrgActionParams,
  tx: TxClient,
): Promise<void> {
  const memberships = await orgRepository.findOrgMembershipsForUser(params.actorId, tx)
  const ability = defineAbilityFor(memberships)

  if (!ability.can(params.action, buildSubject(params.subjectKind, params.organizationId))) {
    throw new ForbiddenException()
  }
}
