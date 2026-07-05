import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IBaseRepository } from '../../../common/cqrs/types'
import type { IMembership, IMemberProfile, IInvitation, ICreateInvitationData, IUpdateMembershipData } from './collaboration.interfaces'
import type { OrgRole } from '@release-hub/shared'

export abstract class IMembershipRepository implements IBaseRepository<IMembership> {
  abstract findById: RepositoryMethod<[id: string], IMembership | null>
  abstract findProfileById: RepositoryMethod<[id: string], IMemberProfile | null>
  abstract findByOrgAndUser: RepositoryMethod<[organizationId: string, userId: string], IMembership | null>
  abstract findByOrgAndEmail: RepositoryMethod<[organizationId: string, email: string], IMembership | null>
  abstract findAllByOrganization: RepositoryMethod<[organizationId: string], IMemberProfile[]>
  abstract countOwners: RepositoryMethod<[organizationId: string], number>
  abstract create: RepositoryMethod<[userId: string, organizationId: string, role: OrgRole], IMembership>
  abstract update: RepositoryMethod<[id: string, data: IUpdateMembershipData], IMembership>
  abstract delete: RepositoryMethod<[id: string], void>
}

export abstract class IInvitationRepository implements IBaseRepository<IInvitation> {
  abstract findById: RepositoryMethod<[id: string], IInvitation | null>
  abstract findByToken: RepositoryMethod<[token: string], IInvitation | null>
  abstract findPendingByOrgAndEmail: RepositoryMethod<[organizationId: string, email: string], IInvitation | null>
  abstract findAllByOrganization: RepositoryMethod<[organizationId: string], IInvitation[]>
  abstract create: RepositoryMethod<[data: ICreateInvitationData], IInvitation>
  abstract accept: RepositoryMethod<[id: string], IInvitation>
  abstract revoke: RepositoryMethod<[id: string], IInvitation>
  abstract markExpired: RepositoryMethod<[id: string], IInvitation>
}
