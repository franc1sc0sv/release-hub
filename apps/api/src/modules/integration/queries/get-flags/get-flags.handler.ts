import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithFlagRepository } from '../../interfaces/flagsmith-flag.repository'
import { FlagRefType, FlagEnvironmentStateType, FlagsResultType } from '../../types/flag-ref.type'
import { GetFlagsQuery } from './get-flags.query'

@QueryHandler(GetFlagsQuery)
export class GetFlagsHandler extends BaseQueryHandler<GetFlagsQuery, FlagsResultType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
  ) {
    super(db)
  }

  protected async handle(query: GetFlagsQuery, tx: TxClient): Promise<FlagsResultType> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

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
        statuses: query.statuses,
        activity: query.activity,
        watchedEnvironments: project.conflictEnvironments,
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
          value: state.value,
        }),
      )
      return Object.assign(new FlagRefType(), {
        key: flag.key,
        createdAt: flag.createdAt,
        environments: envStates,
        deploymentStatus: flag.deploymentStatus,
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
