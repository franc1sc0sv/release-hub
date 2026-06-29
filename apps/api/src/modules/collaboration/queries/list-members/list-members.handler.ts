import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IMembershipRepository } from '../../interfaces/collaboration.repository'
import type { IMemberProfile } from '../../interfaces/collaboration.interfaces'
import { ListMembersQuery } from './list-members.query'

@QueryHandler(ListMembersQuery)
export class ListMembersHandler extends BaseQueryHandler<ListMembersQuery, IMemberProfile[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly membershipRepository: IMembershipRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListMembersQuery, tx: TxClient): Promise<IMemberProfile[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.actorId, tx)
    const ability = defineAbilityFor(memberships)

    if (!ability.can(Action.READ, { kind: Subject.MEMBERSHIP, __type: Subject.MEMBERSHIP, projectId: query.projectId })) {
      throw new ForbiddenException()
    }

    return this.membershipRepository.findAllByProject(query.projectId, tx)
  }
}
