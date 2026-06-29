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
import { GetReleasesQuery } from './get-releases.query'

@QueryHandler(GetReleasesQuery)
export class GetReleasesHandler extends BaseQueryHandler<GetReleasesQuery, ReleaseObjectType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleasesQuery, tx: TxClient): Promise<ReleaseObjectType[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const releases = await this.releaseRepository.findAllByProject(query.projectId, tx)
    return releases.map(toReleaseObjectType)
  }
}
