import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { ILinearSyncActionRepository } from '../../interfaces/linear-sync-action.repository'
import { LinearSyncActionType, toLinearSyncActionType } from '../../types/linear-sync-action.type'
import { GetReleaseLinearSyncQuery } from './get-release-linear-sync.query'

@QueryHandler(GetReleaseLinearSyncQuery)
export class GetReleaseLinearSyncHandler extends BaseQueryHandler<GetReleaseLinearSyncQuery, LinearSyncActionType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly actionRepository: ILinearSyncActionRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetReleaseLinearSyncQuery, tx: TxClient): Promise<LinearSyncActionType[]> {
    const release = await this.releaseRepository.findById(query.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: release.projectId, action: Action.READ, subjectKind: Subject.RELEASE },
      tx,
    )

    const actions = await this.actionRepository.findAllForRelease(query.releaseId, tx)
    return actions.map(toLinearSyncActionType)
  }
}
