import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IFlagsmithClient } from '../../interfaces/flagsmith-client.abstract'
import { FlagSortField } from '../../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../../common/types/sort-direction.enum'
import { FlagRefType, FlagEnvironmentStateType, FlagsResultType } from '../../types/flag-ref.type'
import { GetFlagsQuery } from './get-flags.query'

@QueryHandler(GetFlagsQuery)
export class GetFlagsHandler extends BaseQueryHandler<GetFlagsQuery, FlagsResultType> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly flagsmithClient: IFlagsmithClient,
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

    const empty: FlagsResultType = { environments: [], totalCount: 0, items: [] }

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

    const { environments, flags } = result.data

    let items = flags.map((flag): FlagRefType => {
      const envStates = environments.map((name): FlagEnvironmentStateType => {
        const state = Object.assign(new FlagEnvironmentStateType(), {
          name,
          enabled: flag.states[name] ?? false,
        })
        return state
      })
      return Object.assign(new FlagRefType(), {
        key: flag.key,
        createdAt: flag.createdAt ? new Date(flag.createdAt) : null,
        environments: envStates,
      })
    })

    if (query.search) {
      const needle = query.search.toLowerCase()
      items = items.filter((item) => item.key.toLowerCase().includes(needle))
    }

    const totalCount = items.length

    items = this.sort(items, query.sortField, query.sortDirection, query.sortEnvironment)

    items = items.slice(query.offset, query.offset + query.limit)

    return Object.assign(new FlagsResultType(), { environments, totalCount, items })
  }

  private sort(
    items: FlagRefType[],
    field: FlagSortField,
    direction: SortDirection,
    sortEnvironment: string | undefined,
  ): FlagRefType[] {
    const multiplier = direction === SortDirection.ASC ? 1 : -1

    return [...items].sort((a, b) => {
      if (field === FlagSortField.NAME) {
        return multiplier * a.key.localeCompare(b.key)
      }

      if (field === FlagSortField.CREATED) {
        const aTime = a.createdAt?.getTime() ?? null
        const bTime = b.createdAt?.getTime() ?? null
        if (aTime === null && bTime === null) return a.key.localeCompare(b.key)
        if (aTime === null) return 1
        if (bTime === null) return -1
        const diff = aTime - bTime
        return diff !== 0 ? multiplier * diff : a.key.localeCompare(b.key)
      }

      if (field === FlagSortField.ENVIRONMENT) {
        if (!sortEnvironment) return multiplier * a.key.localeCompare(b.key)
        const aEnabled = a.environments.find((e) => e.name === sortEnvironment)?.enabled ?? false
        const bEnabled = b.environments.find((e) => e.name === sortEnvironment)?.enabled ?? false
        if (aEnabled === bEnabled) return a.key.localeCompare(b.key)
        const enabledFirst = aEnabled ? -1 : 1
        return multiplier * enabledFirst
      }

      return 0
    })
  }
}
