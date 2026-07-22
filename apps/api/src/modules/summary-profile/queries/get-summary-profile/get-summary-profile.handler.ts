import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { ISummaryProfileRepository } from '../../interfaces/summary-profile.repository'
import { SummaryProfileType } from '../../types/summary-profile.type'
import { toSummaryProfileType } from '../../types/summary-profile.mappers'
import { GetSummaryProfileQuery } from './get-summary-profile.query'

@QueryHandler(GetSummaryProfileQuery)
export class GetSummaryProfileHandler extends BaseQueryHandler<GetSummaryProfileQuery, SummaryProfileType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly summaryProfileRepository: ISummaryProfileRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetSummaryProfileQuery, tx: TxClient): Promise<SummaryProfileType> {
    const profile = await this.summaryProfileRepository.findById(query.profileId, tx)
    if (!profile) throw new NotFoundException('SummaryProfile')

    await authorizeProjectAction(
      this.orgRepository,
      { actorId: query.userId, projectId: profile.projectId, action: Action.READ, subjectKind: Subject.SUMMARY_PROFILE },
      tx,
    )

    return toSummaryProfileType(profile)
  }
}
