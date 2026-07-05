import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { ITrackedFlagRepository } from '../../interfaces/tracked-flag.repository'
import { TrackedFlagType } from '../../types/tracked-flag.type'
import { toTrackedFlagType } from '../../types/flag-tracking.mappers'
import { GetTrackedFlagsQuery } from './get-tracked-flags.query'

@QueryHandler(GetTrackedFlagsQuery)
export class GetTrackedFlagsHandler extends BaseQueryHandler<GetTrackedFlagsQuery, TrackedFlagType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly trackedFlagRepository: ITrackedFlagRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetTrackedFlagsQuery, tx: TxClient): Promise<TrackedFlagType[]> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    const flags = await this.trackedFlagRepository.findAllForProject(query.projectId, tx)
    return flags.map(toTrackedFlagType)
  }
}
