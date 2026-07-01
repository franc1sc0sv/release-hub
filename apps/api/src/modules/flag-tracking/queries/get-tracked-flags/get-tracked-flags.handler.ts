import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { TrackedFlagType } from '../../types/tracked-flag.type'
import { toTrackedFlagType } from '../../types/flag-tracking.mappers'
import { GetTrackedFlagsQuery } from './get-tracked-flags.query'

@QueryHandler(GetTrackedFlagsQuery)
export class GetTrackedFlagsHandler extends BaseQueryHandler<GetTrackedFlagsQuery, TrackedFlagType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetTrackedFlagsQuery, tx: TxClient): Promise<TrackedFlagType[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const flags = await this.trackedFlagRepository.findAllForProject(query.projectId, tx)
    return flags.map(toTrackedFlagType)
  }
}
