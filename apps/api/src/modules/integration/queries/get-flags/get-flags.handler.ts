import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithFlagRepository } from '../../interfaces/flagsmith-flag.repository'
import { FlagRefType, FlagEnvironmentStateType, FlagsResultType } from '../../types/flag-ref.type'
import { GetFlagsQuery } from './get-flags.query'

@QueryHandler(GetFlagsQuery)
export class GetFlagsHandler extends BaseQueryHandler<GetFlagsQuery, FlagsResultType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagsQuery, tx: TxClient): Promise<FlagsResultType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (!ability.can(Action.READ, { kind: Subject.PROJECT, __type: Subject.PROJECT, projectId: query.projectId })) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const empty: FlagsResultType = { environments: [], totalCount: 0, items: [], lastSyncedAt: null }

    if (!project.flagsmithEnabled) return empty

    const matrix = await this.flagsmithFlagRepository.findFlagMatrix(
      {
        projectId: query.projectId,
        search: query.search,
        sortField: query.sortField,
        sortEnvironment: query.sortEnvironment,
        sortDirection: query.sortDirection,
        limit: query.limit,
        offset: query.offset,
      },
      tx,
    )

    const items = matrix.items.map((flag): FlagRefType => {
      const envStates = flag.states.map((state): FlagEnvironmentStateType =>
        Object.assign(new FlagEnvironmentStateType(), {
          name: state.environmentName,
          enabled: state.enabled,
        }),
      )
      return Object.assign(new FlagRefType(), {
        key: flag.key,
        createdAt: flag.createdAt,
        environments: envStates,
      })
    })

    return Object.assign(new FlagsResultType(), {
      environments: matrix.environments,
      totalCount: matrix.totalCount,
      items,
      lastSyncedAt: matrix.lastSyncedAt,
    })
  }
}
