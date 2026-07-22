import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { ISummaryProfileRepository } from '../../interfaces/summary-profile.repository'
import { SummaryProfileType } from '../../types/summary-profile.type'
import { toSummaryProfileType } from '../../types/summary-profile.mappers'
import { ListSummaryProfilesQuery } from './list-summary-profiles.query'

@QueryHandler(ListSummaryProfilesQuery)
export class ListSummaryProfilesHandler extends BaseQueryHandler<ListSummaryProfilesQuery, SummaryProfileType[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly summaryProfileRepository: ISummaryProfileRepository,
  ) {
    super(db)
  }

  protected async handle(query: ListSummaryProfilesQuery, tx: TxClient): Promise<SummaryProfileType[]> {
    await authorizeProjectAction(
      this.orgRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.SUMMARY_PROFILE },
      tx,
    )

    const profiles = await this.summaryProfileRepository.listByProject(query.projectId, tx)

    return profiles.map((profile) => toSummaryProfileType(profile))
  }
}
