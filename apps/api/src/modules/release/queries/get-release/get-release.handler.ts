import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { GetReleaseQuery } from './get-release.query'

@QueryHandler(GetReleaseQuery)
export class GetReleaseHandler extends BaseQueryHandler<GetReleaseQuery, ReleaseObjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleaseQuery, tx: TxClient): Promise<ReleaseObjectType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (
      !ability.can(Action.READ, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    return toReleaseObjectType(release)
  }
}
