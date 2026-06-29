import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithClient } from '../../interfaces/flagsmith-client.abstract'
import { FlagEnvironmentStateType, FlagComparisonRowType, FlagComparisonResultType } from '../../types/flag-ref.type'
import { CompareFlagsQuery } from './compare-flags.query'

@QueryHandler(CompareFlagsQuery)
export class CompareFlagsHandler extends BaseQueryHandler<CompareFlagsQuery, FlagComparisonResultType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithClient: IFlagsmithClient,
  ) {
    super(db)
  }

  protected async handle(query: CompareFlagsQuery, tx: TxClient): Promise<FlagComparisonResultType> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (!ability.can(Action.READ, { kind: Subject.PROJECT, __type: Subject.PROJECT, projectId: query.projectId })) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const empty: FlagComparisonResultType = { baselineEnvironments: [], comparedEnvironments: [], items: [] }

    if (!project.flagsmithEnabled) return empty

    const credentials = await this.projectRepository.findCredentials(query.projectId, tx)
    if (!credentials?.flagsmithUrl || !credentials.flagsmithApiKey || !credentials.flagsmithProjectId) {
      return empty
    }

    const result = await this.flagsmithClient.fetchAllEnvironmentFlags(
      credentials.flagsmithUrl,
      credentials.flagsmithApiKey,
      credentials.flagsmithProjectId,
    )

    if (!result.ok) return empty

    const { environments: allEnvironments, flags } = result.data

    const baselineEnvNames = query.baselineEnvironments.filter((name) => allEnvironments.includes(name))
    const comparedEnvNames = query.comparedEnvironments
      .filter((name) => allEnvironments.includes(name))
      .filter((name) => !baselineEnvNames.includes(name))

    const items: FlagComparisonRowType[] = []

    for (const flag of flags) {
      const baseline = baselineEnvNames.map((name): FlagEnvironmentStateType =>
        Object.assign(new FlagEnvironmentStateType(), { name, enabled: flag.states[name] ?? false }),
      )

      const firstValue = baseline[0]?.enabled ?? false
      const baselineConflict = baseline.some((e) => e.enabled !== firstValue)
      const baselineEnabled = baselineConflict ? null : firstValue

      const divergences = baselineConflict
        ? []
        : comparedEnvNames
            .map((name): FlagEnvironmentStateType =>
              Object.assign(new FlagEnvironmentStateType(), { name, enabled: flag.states[name] ?? false }),
            )
            .filter((e) => e.enabled !== baselineEnabled)

      if (!baselineConflict && divergences.length === 0) continue

      items.push(
        Object.assign(new FlagComparisonRowType(), {
          key: flag.key,
          createdAt: flag.createdAt ? new Date(flag.createdAt) : null,
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
