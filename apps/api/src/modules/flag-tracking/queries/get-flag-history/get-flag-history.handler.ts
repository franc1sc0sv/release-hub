import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IFlagHistoryRepository } from '../../interfaces/flag-history.repository'
import { FlagHistoryPageType, FlagHistoryEventEntryType } from '../../types/flag-history.type'
import { GetFlagHistoryQuery } from './get-flag-history.query'

@QueryHandler(GetFlagHistoryQuery)
export class GetFlagHistoryHandler extends BaseQueryHandler<GetFlagHistoryQuery, FlagHistoryPageType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagHistoryQuery, tx: TxClient): Promise<FlagHistoryPageType> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    const page = await this.flagHistoryRepository.findPage(
      { projectId: query.projectId, flagKey: query.flagKey, limit: query.limit, offset: query.offset },
      tx,
    )

    return Object.assign(new FlagHistoryPageType(), {
      items: page.items.map((event) => Object.assign(new FlagHistoryEventEntryType(), event)),
      totalCount: page.totalCount,
    })
  }
}
