import type { RepositoryMethod } from '../../../common/cqrs/types'
import type { IBaseRepository } from '../../../common/cqrs/types'
import type { IMembership, IMemberProfile, IInvitation, ICreateInvitationData, IUpdateMembershipData } from './collaboration.interfaces'
import type { ProjectRole } from '../../../common/types/project-role.enum'

export abstract class IMembershipRepository implements IBaseRepository<IMembership> {
  abstract findById: RepositoryMethod<[id: string], IMembership | null>
  abstract findProfileById: RepositoryMethod<[id: string], IMemberProfile | null>
  abstract findByProjectAndUser: RepositoryMethod<[projectId: string, userId: string], IMembership | null>
  abstract findByProjectAndEmail: RepositoryMethod<[projectId: string, email: string], IMembership | null>
  abstract findAllByProject: RepositoryMethod<[projectId: string], IMemberProfile[]>
  abstract countOwners: RepositoryMethod<[projectId: string], number>
  abstract create: RepositoryMethod<[userId: string, projectId: string, role: ProjectRole], IMembership>
  abstract update: RepositoryMethod<[id: string, data: IUpdateMembershipData], IMembership>
  abstract delete: RepositoryMethod<[id: string], void>
}

export abstract class IInvitationRepository implements IBaseRepository<IInvitation> {
  abstract findById: RepositoryMethod<[id: string], IInvitation | null>
  abstract findByToken: RepositoryMethod<[token: string], IInvitation | null>
  abstract findPendingByProjectAndEmail: RepositoryMethod<[projectId: string, email: string], IInvitation | null>
  abstract findAllByProject: RepositoryMethod<[projectId: string], IInvitation[]>
  abstract create: RepositoryMethod<[data: ICreateInvitationData], IInvitation>
  abstract accept: RepositoryMethod<[id: string], IInvitation>
  abstract revoke: RepositoryMethod<[id: string], IInvitation>
  abstract markExpired: RepositoryMethod<[id: string], IInvitation>
}
