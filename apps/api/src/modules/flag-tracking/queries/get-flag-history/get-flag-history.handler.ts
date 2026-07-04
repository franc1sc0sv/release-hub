import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagHistoryRepository } from '../../interfaces/flag-history.repository'
import { FlagHistoryPageType, FlagHistoryEventEntryType } from '../../types/flag-history.type'
import { GetFlagHistoryQuery } from './get-flag-history.query'

@QueryHandler(GetFlagHistoryQuery)
export class GetFlagHistoryHandler extends BaseQueryHandler<GetFlagHistoryQuery, FlagHistoryPageType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly flagHistoryRepository: IFlagHistoryRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagHistoryQuery, tx: TxClient): Promise<FlagHistoryPageType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, { kind: Subject.PROJECT, __type: Subject.PROJECT, projectId: query.projectId })
    ) {
      throw new ForbiddenException()
    }

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
