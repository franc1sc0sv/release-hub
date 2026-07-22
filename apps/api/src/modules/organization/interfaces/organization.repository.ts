import type { IBaseRepository, RepositoryMethod } from '../../../common/cqrs/types'
import type { IOrgMembership } from '@release-hub/shared'
import type {
  IOrganization,
  IUserOrganization,
  IOrganizationMemberProfile,
} from './organization.interfaces'

export abstract class IOrganizationRepository implements IBaseRepository<IOrganization> {
  abstract findById: RepositoryMethod<[id: string], IOrganization | null>
  abstract findOrgMembershipsForUser: RepositoryMethod<[userId: string], IOrgMembership[]>
  abstract findOrganizationIdForProject: RepositoryMethod<[projectId: string], string | null>
  abstract createOrganizationWithOwner: RepositoryMethod<[userId: string, name: string], { id: string }>
  abstract createForUser: RepositoryMethod<[userId: string, name: string, slug: string], { id: string }>
  abstract updateName: RepositoryMethod<[organizationId: string, name: string, slug: string], IOrganization>
  abstract softDelete: RepositoryMethod<[organizationId: string], void>
  abstract softDeleteProjectsForOrganization: RepositoryMethod<[organizationId: string], void>
  abstract slugExists: RepositoryMethod<[slug: string], boolean>
  abstract findOrganizationsForUser: RepositoryMethod<[userId: string], IUserOrganization[]>
  abstract listMembers: RepositoryMethod<[organizationId: string], IOrganizationMemberProfile[]>
  abstract findActiveInstallationIdForOrg: RepositoryMethod<[organizationId: string], string | null>
}
