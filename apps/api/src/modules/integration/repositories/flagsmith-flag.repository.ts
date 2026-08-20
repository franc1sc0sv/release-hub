import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { FlagsmithSyncStatus, kysely } from '@release-hub/db'
import type { ReleaseFlagDecisionType } from '@release-hub/db'
import { sql } from 'kysely'
import { IFlagsmithFlagRepository } from '../interfaces/flagsmith-flag.repository'
import { FlagSortField } from '../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../common/types/sort-direction.enum'
import { FlagActivityFilter } from '../../../common/types/flag-activity-filter.enum'
import { FlagDeploymentStatus } from '../../../common/types/flag-deployment-status.enum'
import { computeFlagDeploymentStatus } from '../../../common/types/flag-deployment-status.util'
import type {
  IUpsertFlagsmithEnvironmentData,
  IUpsertFlagsmithFlagData,
  ICreateFlagsmithSyncRunData,
  IFlagsmithSyncRun,
  ICompleteFlagsmithSyncRunData,
  IFlagsmithFlagMatrixFilters,
  IFlagsmithFlagMatrixResult,
  IFlagsmithFlagMatrixItem,
  IFlagsmithFlagRecord,
  IReconcileFlagsResult,
  IFlagsmithFlagStateChange,
  IFlagsmithFlagValueChange,
  IUpsertFlagsmithFlagWithStatesResult,
  IUpsertFlagsmithFlagStateChangeResult,
  IFlagsmithFlagDetail,
  IFlagsmithEnvironmentCredential,
  ISetFlagStateTarget,
  IFlagStateUpdate,
} from '../interfaces/flagsmith-sync.interfaces'

function toIFlagsmithSyncRun(row: {
  id: string
  projectId: string
  source: string
  status: string
  flagCount: number
  startedAt: Date
  finishedAt: Date | null
  error: string | null
}): IFlagsmithSyncRun {
  return {
    id: row.id,
    projectId: row.projectId,
    source: row.source as IFlagsmithSyncRun['source'],
    status: row.status as IFlagsmithSyncRun['status'],
    flagCount: row.flagCount,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    error: row.error,
  }
}

@Injectable()
export class FlagsmithFlagRepository extends IFlagsmithFlagRepository {
  upsertEnvironment = async (
    data: IUpsertFlagsmithEnvironmentData,
    tx: TxClient,
  ): Promise<{ id: string; name: string }> => {
    const row = await tx.flagsmithEnvironment.upsert({
      where: { projectId_name: { projectId: data.projectId, name: data.name } },
      create: {
        projectId: data.projectId,
        name: data.name,
        flagsmithApiKey: data.flagsmithApiKey,
        sortOrder: data.sortOrder,
      },
      update: {
        flagsmithApiKey: data.flagsmithApiKey,
        sortOrder: data.sortOrder,
      },
    })
    return { id: row.id, name: row.name }
  }

  upsertFlagWithStates = async (
    data: IUpsertFlagsmithFlagData,
    tx: TxClient,
  ): Promise<IUpsertFlagsmithFlagWithStatesResult> => {
    const existingFlag = await tx.flagsmithFlag.findUnique({
      where: { projectId_key: { projectId: data.projectId, key: data.key } },
      select: { id: true, deletedAt: true },
    })
    const isNewFlag = !existingFlag || existingFlag.deletedAt !== null

    const flag = await tx.flagsmithFlag.upsert({
      where: { projectId_key: { projectId: data.projectId, key: data.key } },
      create: {
        projectId: data.projectId,
        key: data.key,
        flagCreatedAt: data.createdAt,
        lastSyncedAt: new Date(),
        deletedAt: null,
      },
      update: {
        ...(data.createdAt !== null && { flagCreatedAt: data.createdAt }),
        lastSyncedAt: new Date(),
        deletedAt: null,
      },
    })

    const stateChanges: IUpsertFlagsmithFlagStateChangeResult[] = []

    for (const state of data.states) {
      const environment = await tx.flagsmithEnvironment.findFirst({
        where: { projectId: data.projectId, name: state.environmentName },
        select: { id: true },
      })
      if (!environment) continue

      const existingState = await tx.flagsmithFlagState.findUnique({
        where: { flagId_environmentId: { flagId: flag.id, environmentId: environment.id } },
        select: { enabled: true, value: true },
      })

      await tx.flagsmithFlagState.upsert({
        where: { flagId_environmentId: { flagId: flag.id, environmentId: environment.id } },
        create: { flagId: flag.id, environmentId: environment.id, enabled: state.enabled, value: state.value },
        update: { enabled: state.enabled, value: state.value },
      })

      stateChanges.push({
        environmentName: state.environmentName,
        previousEnabled: existingState?.enabled ?? null,
        newEnabled: state.enabled,
        previousValue: existingState?.value ?? null,
        newValue: state.value,
      })
    }

    return { flagId: flag.id, isNewFlag, stateChanges }
  }

  reconcileFlags = async (
    projectId: string,
    flags: IUpsertFlagsmithFlagData[],
    tx: TxClient,
  ): Promise<IReconcileFlagsResult> => {
    const syncedAt = new Date()
    const incomingKeys = flags.map((flag) => flag.key)

    const environments = await tx.flagsmithEnvironment.findMany({
      where: { projectId },
      select: { id: true, name: true },
    })
    const environmentIdByName = new Map(environments.map((env) => [env.name, env.id]))

    const existing = await tx.flagsmithFlag.findMany({
      where: { projectId },
      select: { id: true, key: true, flagCreatedAt: true, deletedAt: true },
    })
    const existingByKey = new Map(existing.map((flag) => [flag.key, flag]))

    const existingFlagIds = existing
      .filter((flag) => incomingKeys.includes(flag.key))
      .map((flag) => flag.id)
    const keyByExistingFlagId = new Map(existing.map((flag) => [flag.id, flag.key]))

    const existingStateRows =
      existingFlagIds.length === 0
        ? []
        : await tx.flagsmithFlagState.findMany({
            where: { flagId: { in: existingFlagIds } },
            select: {
              flagId: true,
              enabled: true,
              value: true,
              environment: { select: { name: true } },
            },
          })
    const existingStateByKeyEnv = new Map<string, { enabled: boolean; value: string | null }>()
    for (const row of existingStateRows) {
      const key = keyByExistingFlagId.get(row.flagId)
      if (!key) continue
      existingStateByKeyEnv.set(`${key}::${row.environment.name}`, { enabled: row.enabled, value: row.value })
    }

    const toCreate = flags.filter((flag) => !existingByKey.has(flag.key))
    const addedKeys = flags
      .filter((flag) => {
        const current = existingByKey.get(flag.key)
        return current === undefined || current.deletedAt !== null
      })
      .map((flag) => flag.key)

    if (toCreate.length > 0) {
      await tx.flagsmithFlag.createMany({
        data: toCreate.map((flag) => ({
          projectId,
          key: flag.key,
          flagCreatedAt: flag.createdAt,
          lastSyncedAt: syncedAt,
        })),
      })
    }

    const existingIncomingKeys = incomingKeys.filter((key) => existingByKey.has(key))
    if (existingIncomingKeys.length > 0) {
      await tx.flagsmithFlag.updateMany({
        where: { projectId, key: { in: existingIncomingKeys } },
        data: { lastSyncedAt: syncedAt, deletedAt: null },
      })
    }

    const createdAtCorrections = flags.filter((flag) => {
      const current = existingByKey.get(flag.key)
      return (
        current !== undefined &&
        flag.createdAt !== null &&
        current.flagCreatedAt?.getTime() !== flag.createdAt.getTime()
      )
    })
    for (const flag of createdAtCorrections) {
      await tx.flagsmithFlag.updateMany({
        where: { projectId, key: flag.key },
        data: { flagCreatedAt: flag.createdAt },
      })
    }

    const rows = await tx.flagsmithFlag.findMany({
      where: { projectId, key: { in: incomingKeys } },
      select: { id: true, key: true },
    })
    const flagIdByKey = new Map(rows.map((row) => [row.key, row.id]))

    await tx.flagsmithFlagState.deleteMany({
      where: { flagId: { in: rows.map((row) => row.id) } },
    })

    const stateRows = flags.flatMap((flag) => {
      const flagId = flagIdByKey.get(flag.key)
      if (!flagId) return []
      return flag.states.flatMap((state) => {
        const environmentId = environmentIdByName.get(state.environmentName)
        if (!environmentId) return []
        return [{ flagId, environmentId, enabled: state.enabled, value: state.value }]
      })
    })
    if (stateRows.length > 0) {
      await tx.flagsmithFlagState.createMany({ data: stateRows })
    }

    const enabledChanges: IFlagsmithFlagStateChange[] = []
    const valueChanges: IFlagsmithFlagValueChange[] = []

    for (const flag of flags) {
      const flagId = flagIdByKey.get(flag.key)
      if (!flagId || !existingByKey.has(flag.key)) continue

      for (const state of flag.states) {
        const previous = existingStateByKeyEnv.get(`${flag.key}::${state.environmentName}`)
        if (!previous) continue

        if (previous.enabled !== state.enabled) {
          enabledChanges.push({
            flagId,
            key: flag.key,
            environmentName: state.environmentName,
            previousEnabled: previous.enabled,
            newEnabled: state.enabled,
          })
        }

        if (previous.value !== state.value) {
          valueChanges.push({
            flagId,
            key: flag.key,
            environmentName: state.environmentName,
            previousValue: previous.value,
            newValue: state.value,
          })
        }
      }
    }

    return { addedKeys, enabledChanges, valueChanges }
  }

  softDeleteFlagsNotInKeys = async (projectId: string, keys: string[], tx: TxClient): Promise<string[]> => {
    const removed = await tx.flagsmithFlag.findMany({
      where: { projectId, deletedAt: null, key: { notIn: keys } },
      select: { id: true, key: true },
    })
    if (removed.length === 0) return []

    await tx.flagsmithFlag.updateMany({
      where: { id: { in: removed.map((flag) => flag.id) } },
      data: { deletedAt: new Date() },
    })

    return removed.map((flag) => flag.key)
  }

  softDeleteFlagByKey = async (projectId: string, key: string, tx: TxClient): Promise<number> => {
    const result = await tx.flagsmithFlag.updateMany({
      where: { projectId, key, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    return result.count
  }

  findFlagMatrix = async (
    filters: IFlagsmithFlagMatrixFilters,
    tx: TxClient,
  ): Promise<IFlagsmithFlagMatrixResult> => {
    const [environmentRows, latestSyncRun, candidateFlags, sortEnvironmentId] = await Promise.all([
      tx.flagsmithEnvironment.findMany({
        where: { projectId: filters.projectId },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true },
      }),
      tx.flagsmithSyncRun.findFirst({
        where: { projectId: filters.projectId, status: FlagsmithSyncStatus.completed },
        orderBy: { finishedAt: 'desc' },
        select: { finishedAt: true },
      }),
      tx.flagsmithFlag.findMany({
        where: {
          projectId: filters.projectId,
          ...(filters.search ? { key: { contains: filters.search, mode: 'insensitive' as const } } : {}),
        },
        select: { id: true, key: true, deletedAt: true },
      }),
      this.resolveSortEnvironmentId(filters, tx),
    ])
    const environments = environmentRows.map((env) => env.name)
    const lastSyncedAt = latestSyncRun?.finishedAt ?? null

    if (environments.length === 0) {
      return { environments: [], totalCount: 0, items: [], lastSyncedAt }
    }

    if (candidateFlags.length === 0) {
      return { environments, totalCount: 0, items: [], lastSyncedAt }
    }

    const candidateIds = candidateFlags.map((flag) => flag.id)
    const keyByFlagId = new Map(candidateFlags.map((flag) => [flag.id, flag.key]))
    const deletedFlagIds = new Set(
      candidateFlags.filter((flag) => flag.deletedAt !== null).map((flag) => flag.id),
    )
    const candidateKeys = [...new Set(candidateFlags.map((flag) => flag.key))]

    const watchedEnvironmentIds =
      filters.watchedEnvironments.length > 0
        ? environmentRows.filter((env) => filters.watchedEnvironments.includes(env.name)).map((env) => env.id)
        : []

    const stateAggQuery = kysely
      .selectFrom('flagsmith_flag_states')
      .select(['flag_id', sql<boolean>`bool_or(enabled)`.as('anyEnabled'), sql<boolean>`bool_or(not enabled)`.as('anyDisabled')])
      .where('flag_id', 'in', candidateIds)
      .groupBy('flag_id')
    const compiledAgg = stateAggQuery.compile()

    const watchedAggQuery =
      watchedEnvironmentIds.length > 0
        ? kysely
            .selectFrom('flagsmith_flag_states')
            .select(['flag_id', sql<boolean>`bool_or(not enabled)`.as('anyDisabled')])
            .where('flag_id', 'in', candidateIds)
            .where('environment_id', 'in', watchedEnvironmentIds)
            .groupBy('flag_id')
        : null
    const compiledWatchedAgg = watchedAggQuery?.compile() ?? null

    const [aggRows, watchedAggRows, trackedFlags] = await Promise.all([
      tx.$queryRawUnsafe<{ flag_id: string; anyEnabled: boolean; anyDisabled: boolean }[]>(
        compiledAgg.sql,
        ...compiledAgg.parameters,
      ),
      compiledWatchedAgg
        ? tx.$queryRawUnsafe<{ flag_id: string; anyDisabled: boolean }[]>(
            compiledWatchedAgg.sql,
            ...compiledWatchedAgg.parameters,
          )
        : Promise.resolve([]),
      tx.trackedFlag.findMany({
        where: { projectId: filters.projectId, deletedAt: null, key: { in: candidateKeys } },
        select: { id: true, key: true },
      }),
    ])
    const aggByFlagId = new Map(aggRows.map((row) => [row.flag_id, { anyEnabled: row.anyEnabled, anyDisabled: row.anyDisabled }]))
    const watchedDisabledByFlagId = new Map(watchedAggRows.map((row) => [row.flag_id, row.anyDisabled]))
    const trackedFlagIdByKey = new Map(trackedFlags.map((flag) => [flag.key, flag.id]))

    const decisionRows = await tx.releaseFlagDecision.findMany({
      where: { trackedFlagId: { in: [...trackedFlagIdByKey.values()] } },
      orderBy: { updatedAt: 'desc' },
      select: { trackedFlagId: true, decision: true },
    })
    const latestDecisionByTrackedFlagId = new Map<string, ReleaseFlagDecisionType>()
    for (const row of decisionRows) {
      if (!latestDecisionByTrackedFlagId.has(row.trackedFlagId)) {
        latestDecisionByTrackedFlagId.set(row.trackedFlagId, row.decision)
      }
    }

    const deploymentStatusByFlagId = new Map<string, FlagDeploymentStatus>()
    for (const flagId of candidateIds) {
      if (deletedFlagIds.has(flagId)) {
        deploymentStatusByFlagId.set(flagId, FlagDeploymentStatus.DELETED)
        continue
      }
      const key = keyByFlagId.get(flagId)
      const trackedFlagId = key ? trackedFlagIdByKey.get(key) : undefined
      const decision = trackedFlagId ? (latestDecisionByTrackedFlagId.get(trackedFlagId) ?? null) : null
      const anyDisabled =
        watchedEnvironmentIds.length > 0
          ? (watchedDisabledByFlagId.get(flagId) ?? false)
          : (aggByFlagId.get(flagId)?.anyDisabled ?? false)
      deploymentStatusByFlagId.set(flagId, computeFlagDeploymentStatus(decision, anyDisabled))
    }

    let filteredIds = candidateIds
    if (filters.statuses && filters.statuses.length > 0) {
      const statusSet = new Set(filters.statuses)
      filteredIds = filteredIds.filter((id) =>
        statusSet.has(deploymentStatusByFlagId.get(id) ?? FlagDeploymentStatus.UNTRACKED),
      )
    }
    if (filters.activity) {
      filteredIds = filteredIds.filter((id) => {
        const anyEnabled = aggByFlagId.get(id)?.anyEnabled ?? false
        return filters.activity === FlagActivityFilter.ACTIVE ? anyEnabled : !anyEnabled
      })
    }

    const totalCount = filteredIds.length
    if (totalCount === 0) {
      return { environments, totalCount: 0, items: [], lastSyncedAt }
    }

    const pagedFlagIdsQuery = this.buildPagedFlagIdsQuery(filters, sortEnvironmentId, filteredIds)
    const compiledPagedIds = pagedFlagIdsQuery.compile()
    const pagedIdRows = await tx.$queryRawUnsafe<{ id: string }[]>(
      compiledPagedIds.sql,
      ...compiledPagedIds.parameters,
    )
    const pagedFlagIds = pagedIdRows.map((row) => row.id)

    if (pagedFlagIds.length === 0) {
      return { environments, totalCount, items: [], lastSyncedAt }
    }

    const rowsQuery = kysely
      .selectFrom('flagsmith_flags as flag')
      .leftJoin('flagsmith_flag_states as state', 'state.flag_id', 'flag.id')
      .leftJoin('flagsmith_environments as env', 'env.id', 'state.environment_id')
      .select([
        'flag.id as flagId',
        'flag.key as key',
        'flag.flag_created_at as createdAt',
        'env.name as environmentName',
        'state.enabled as enabled',
        'state.value as value',
      ])
      .where('flag.id', 'in', pagedFlagIds)

    const compiledRows = rowsQuery.compile()
    const rows = await tx.$queryRawUnsafe<
      {
        flagId: string
        key: string
        createdAt: Date | null
        environmentName: string | null
        enabled: boolean | null
        value: string | null
      }[]
    >(compiledRows.sql, ...compiledRows.parameters)

    const flagOrder = new Map(pagedFlagIds.map((id, index) => [id, index]))
    const flagsByOrder = new Map<string, IFlagsmithFlagRecord & { flagId: string }>()

    for (const row of rows) {
      const existing = flagsByOrder.get(row.flagId)
      const record = existing ?? { flagId: row.flagId, key: row.key, createdAt: row.createdAt, states: [] }
      if (row.environmentName !== null) {
        record.states.push({ environmentName: row.environmentName, enabled: row.enabled ?? false, value: row.value })
      }
      flagsByOrder.set(row.flagId, record)
    }

    const items: IFlagsmithFlagMatrixItem[] = [...flagsByOrder.values()]
      .sort((a, b) => (flagOrder.get(a.flagId) ?? 0) - (flagOrder.get(b.flagId) ?? 0))
      .map((record) => {
        const stateByEnv = new Map(record.states.map((state) => [state.environmentName, state]))
        return {
          key: record.key,
          createdAt: record.createdAt,
          states: environments.map((name) => ({
            environmentName: name,
            enabled: stateByEnv.get(name)?.enabled ?? false,
            value: stateByEnv.get(name)?.value ?? null,
          })),
          deploymentStatus: deploymentStatusByFlagId.get(record.flagId) ?? FlagDeploymentStatus.UNTRACKED,
        }
      })

    return { environments, totalCount, items, lastSyncedAt }
  }

  findAllFlagsForProject = async (
    projectId: string,
    tx: TxClient,
  ): Promise<{ environments: string[]; flags: IFlagsmithFlagRecord[]; lastSyncedAt: Date | null }> => {
    const environmentRows = await tx.flagsmithEnvironment.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
      select: { name: true },
    })
    const environments = environmentRows.map((env) => env.name)

    const latestSyncRun = await tx.flagsmithSyncRun.findFirst({
      where: { projectId, status: FlagsmithSyncStatus.completed },
      orderBy: { finishedAt: 'desc' },
      select: { finishedAt: true },
    })
    const lastSyncedAt = latestSyncRun?.finishedAt ?? null

    if (environments.length === 0) {
      return { environments: [], flags: [], lastSyncedAt }
    }

    const rows = await tx.flagsmithFlag.findMany({
      where: { projectId, deletedAt: null },
      orderBy: { key: 'asc' },
      select: {
        key: true,
        flagCreatedAt: true,
        states: { select: { enabled: true, value: true, environment: { select: { name: true } } } },
      },
    })

    const flags: IFlagsmithFlagRecord[] = rows.map((row) => {
      const stateByEnv = new Map(row.states.map((state) => [state.environment.name, state]))
      return {
        key: row.key,
        createdAt: row.flagCreatedAt,
        states: environments.map((name) => ({
          environmentName: name,
          enabled: stateByEnv.get(name)?.enabled ?? false,
          value: stateByEnv.get(name)?.value ?? null,
        })),
      }
    })

    return { environments, flags, lastSyncedAt }
  }

  findLatestCompletedSyncRun = async (projectId: string, tx: TxClient): Promise<IFlagsmithSyncRun | null> => {
    const row = await tx.flagsmithSyncRun.findFirst({
      where: { projectId, status: FlagsmithSyncStatus.completed },
      orderBy: { finishedAt: 'desc' },
    })
    if (!row) return null
    return toIFlagsmithSyncRun(row)
  }

  findEnabledStatesForKeys = async (
    projectId: string,
    keys: string[],
    tx: TxClient,
  ): Promise<{ key: string; environmentName: string; enabled: boolean }[]> => {
    const rows = await tx.flagsmithFlag.findMany({
      where: { projectId, deletedAt: null, key: { in: keys } },
      select: {
        key: true,
        states: { select: { enabled: true, environment: { select: { name: true } } } },
      },
    })

    return rows.flatMap((row) =>
      row.states.map((state) => ({
        key: row.key,
        environmentName: state.environment.name,
        enabled: state.enabled,
      })),
    )
  }

  findFlagAndEnvironmentIds = async (
    projectId: string,
    key: string,
    environmentName: string,
    tx: TxClient,
  ): Promise<{ flagId: string; environmentId: string } | null> => {
    const flag = await tx.flagsmithFlag.findFirst({
      where: { projectId, key, deletedAt: null },
      select: { id: true },
    })
    if (!flag) return null

    const environment = await tx.flagsmithEnvironment.findFirst({
      where: { projectId, name: environmentName },
      select: { id: true },
    })
    if (!environment) return null

    return { flagId: flag.id, environmentId: environment.id }
  }

  findFlagDetailByKey = async (
    projectId: string,
    key: string,
    tx: TxClient,
  ): Promise<IFlagsmithFlagDetail | null> => {
    const flag = await tx.flagsmithFlag.findFirst({
      where: { projectId, key },
      select: {
        id: true,
        key: true,
        lastSyncedAt: true,
        deletedAt: true,
        states: {
          select: {
            enabled: true,
            value: true,
            updatedAt: true,
            environment: { select: { name: true } },
          },
        },
      },
    })
    if (!flag) return null

    return {
      id: flag.id,
      key: flag.key,
      lastSyncedAt: flag.lastSyncedAt,
      deletedAt: flag.deletedAt,
      environments: flag.states.map((state) => ({
        name: state.environment.name,
        enabled: state.enabled,
        value: state.value,
        updatedAt: state.updatedAt,
      })),
    }
  }

  findEnvironmentCredentials = async (
    projectId: string,
    tx: TxClient,
  ): Promise<IFlagsmithEnvironmentCredential[]> => {
    const rows = await tx.flagsmithEnvironment.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { name: true, flagsmithApiKey: true },
    })
    return rows.map((row) => ({ name: row.name, flagsmithApiKey: row.flagsmithApiKey }))
  }

  softDeleteFlagsByKeys = async (
    projectId: string,
    keys: string[],
    tx: TxClient,
  ): Promise<{ key: string; flagId: string }[]> => {
    if (keys.length === 0) return []

    const rows = await tx.flagsmithFlag.findMany({
      where: { projectId, deletedAt: null, key: { in: keys } },
      select: { id: true, key: true },
    })
    if (rows.length === 0) return []

    await tx.flagsmithFlag.updateMany({
      where: { id: { in: rows.map((row) => row.id) } },
      data: { deletedAt: new Date() },
    })

    return rows.map((row) => ({ key: row.key, flagId: row.id }))
  }

  setStatesEnabled = async (
    projectId: string,
    targets: ISetFlagStateTarget[],
    tx: TxClient,
  ): Promise<IFlagStateUpdate[]> => {
    if (targets.length === 0) return []

    const [flags, environments] = await Promise.all([
      tx.flagsmithFlag.findMany({
        where: { projectId, deletedAt: null, key: { in: targets.map((target) => target.key) } },
        select: { id: true, key: true },
      }),
      tx.flagsmithEnvironment.findMany({
        where: { projectId, name: { in: targets.map((target) => target.environmentName) } },
        select: { id: true, name: true },
      }),
    ])

    const flagIdByKey = new Map(flags.map((flag) => [flag.key, flag.id]))
    const environmentIdByName = new Map(environments.map((environment) => [environment.name, environment.id]))

    const states = await tx.flagsmithFlagState.findMany({
      where: {
        flagId: { in: flags.map((flag) => flag.id) },
        environmentId: { in: environments.map((environment) => environment.id) },
      },
      select: { id: true, flagId: true, environmentId: true, enabled: true },
    })

    const stateByPair = new Map(states.map((state) => [`${state.flagId}:${state.environmentId}`, state]))
    const updates: IFlagStateUpdate[] = []
    const stateIdsToEnable: string[] = []
    const stateIdsToDisable: string[] = []

    for (const target of targets) {
      const flagId = flagIdByKey.get(target.key)
      const environmentId = environmentIdByName.get(target.environmentName)
      if (!flagId || !environmentId) continue

      const state = stateByPair.get(`${flagId}:${environmentId}`)
      if (!state || state.enabled === target.enabled) continue

      if (target.enabled) stateIdsToEnable.push(state.id)
      else stateIdsToDisable.push(state.id)

      updates.push({
        flagId,
        key: target.key,
        environmentName: target.environmentName,
        previousEnabled: state.enabled,
        newEnabled: target.enabled,
      })
    }

    if (stateIdsToEnable.length > 0) {
      await tx.flagsmithFlagState.updateMany({
        where: { id: { in: stateIdsToEnable } },
        data: { enabled: true },
      })
    }

    if (stateIdsToDisable.length > 0) {
      await tx.flagsmithFlagState.updateMany({
        where: { id: { in: stateIdsToDisable } },
        data: { enabled: false },
      })
    }

    return updates
  }

  findEnvironmentNames = async (projectId: string, tx: TxClient): Promise<string[]> => {
    const rows = await tx.flagsmithEnvironment.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { name: true },
    })
    return rows.map((row) => row.name)
  }

  createSyncRun = async (data: ICreateFlagsmithSyncRunData, tx: TxClient): Promise<IFlagsmithSyncRun> => {
    const row = await tx.flagsmithSyncRun.create({
      data: {
        projectId: data.projectId,
        source: data.source,
        status: FlagsmithSyncStatus.running,
      },
    })
    return toIFlagsmithSyncRun(row)
  }

  completeSyncRun = async (id: string, data: ICompleteFlagsmithSyncRunData, tx: TxClient): Promise<void> => {
    await tx.flagsmithSyncRun.update({
      where: { id },
      data: {
        status: FlagsmithSyncStatus.completed,
        flagCount: data.flagCount,
        finishedAt: new Date(),
      },
    })
  }

  failSyncRun = async (id: string, error: string, tx: TxClient): Promise<void> => {
    await tx.flagsmithSyncRun.update({
      where: { id },
      data: {
        status: FlagsmithSyncStatus.failed,
        error,
        finishedAt: new Date(),
      },
    })
  }

  private async resolveSortEnvironmentId(
    filters: IFlagsmithFlagMatrixFilters,
    tx: TxClient,
  ): Promise<string | null> {
    if (filters.sortField !== FlagSortField.ENVIRONMENT || !filters.sortEnvironment) return null

    const environment = await tx.flagsmithEnvironment.findFirst({
      where: { projectId: filters.projectId, name: filters.sortEnvironment },
      select: { id: true },
    })
    return environment?.id ?? null
  }

  private buildPagedFlagIdsQuery(
    filters: IFlagsmithFlagMatrixFilters,
    sortEnvironmentId: string | null,
    restrictIds: string[],
  ) {
    const direction = filters.sortDirection === SortDirection.ASC ? 'asc' : 'desc'
    const limit = filters.limit
    const offset = filters.offset

    let query = kysely
      .selectFrom('flagsmith_flags as flag')
      .select('flag.id as id')
      .where('flag.id', 'in', restrictIds)

    if (filters.sortField === FlagSortField.NAME) {
      const ordered = query.orderBy('flag.key', direction)
      return limit === undefined ? ordered : ordered.limit(limit).offset(offset)
    }

    if (filters.sortField === FlagSortField.ENVIRONMENT && sortEnvironmentId) {
      const ordered = query
        .leftJoin('flagsmith_flag_states as sort_state', (join) =>
          join
            .onRef('sort_state.flag_id', '=', 'flag.id')
            .on('sort_state.environment_id', '=', sortEnvironmentId),
        )
        .orderBy(sql`coalesce(sort_state.enabled, false)`, direction)
        .orderBy('flag.key', 'asc')
      return limit === undefined ? ordered : ordered.limit(limit).offset(offset)
    }

    const ordered = query.orderBy('flag.flag_created_at', direction).orderBy('flag.key', 'asc')
    return limit === undefined ? ordered : ordered.limit(limit).offset(offset)
  }
}
