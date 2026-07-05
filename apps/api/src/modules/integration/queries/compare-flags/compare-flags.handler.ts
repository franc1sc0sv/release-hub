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
import { FlagEnvironmentStateType, FlagComparisonRowType, FlagComparisonResultType } from '../../types/flag-ref.type'
import { CompareFlagsQuery } from './compare-flags.query'

@QueryHandler(CompareFlagsQuery)
export class CompareFlagsHandler extends BaseQueryHandler<CompareFlagsQuery, FlagComparisonResultType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithFlagRepository: IFlagsmithFlagRepository,
  ) {
    super(db)
  }

  protected async handle(query: CompareFlagsQuery, tx: TxClient): Promise<FlagComparisonResultType> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const empty: FlagComparisonResultType = { baselineEnvironments: [], comparedEnvironments: [], items: [] }

    if (!project.flagsmithEnabled) return empty

    const { environments: allEnvironments, flags } = await this.flagsmithFlagRepository.findAllFlagsForProject(
      query.projectId,
      tx,
    )

    const baselineEnvNames = query.baselineEnvironments.filter((name) => allEnvironments.includes(name))
    const comparedEnvNames = query.comparedEnvironments
      .filter((name) => allEnvironments.includes(name))
      .filter((name) => !baselineEnvNames.includes(name))

    const items: FlagComparisonRowType[] = []

    for (const flag of flags) {
      const stateByEnv = new Map(flag.states.map((state) => [state.environmentName, state.enabled]))

      const baseline = baselineEnvNames.map((name): FlagEnvironmentStateType =>
        Object.assign(new FlagEnvironmentStateType(), { name, enabled: stateByEnv.get(name) ?? false }),
      )

      const firstValue = baseline[0]?.enabled ?? false
      const baselineConflict = baseline.some((e) => e.enabled !== firstValue)
      const baselineEnabled = baselineConflict ? null : firstValue

      const divergences = baselineConflict
        ? []
        : comparedEnvNames
            .map((name): FlagEnvironmentStateType =>
              Object.assign(new FlagEnvironmentStateType(), { name, enabled: stateByEnv.get(name) ?? false }),
            )
            .filter((e) => e.enabled !== baselineEnabled)

      if (!baselineConflict && divergences.length === 0) continue

      items.push(
        Object.assign(new FlagComparisonRowType(), {
          key: flag.key,
          createdAt: flag.createdAt,
          baselineEnabled,
          baselineConflict,
          baseline,
          divergences,
        }),
      )
    }

    items.sort((a, b) => a.key.localeCompare(b.key))

    return Object.assign(new FlagComparisonResultType(), {
      baselineEnvironments: baselineEnvNames,
      comparedEnvironments: comparedEnvNames,
      items,
    })
  }
}
