import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { FlagsmithSyncStatus, kysely } from '@release-hub/db'
import { sql } from 'kysely'
import { IFlagsmithFlagRepository } from '../interfaces/flagsmith-flag.repository'
import { FlagSortField } from '../../../common/types/flag-sort-field.enum'
import { SortDirection } from '../../../common/types/sort-direction.enum'
import type {
  IUpsertFlagsmithEnvironmentData,
  IUpsertFlagsmithFlagData,
  ICreateFlagsmithSyncRunData,
  IFlagsmithSyncRun,
  ICompleteFlagsmithSyncRunData,
  IFlagsmithFlagMatrixFilters,
  IFlagsmithFlagMatrixResult,
  IFlagsmithFlagRecord,
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

  upsertFlagWithStates = async (data: IUpsertFlagsmithFlagData, tx: TxClient): Promise<void> => {
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

    for (const state of data.states) {
      const environment = await tx.flagsmithEnvironment.findFirst({
        where: { projectId: data.projectId, name: state.environmentName },
        select: { id: true },
      })
      if (!environment) continue

      await tx.flagsmithFlagState.upsert({
        where: { flagId_environmentId: { flagId: flag.id, environmentId: environment.id } },
        create: { flagId: flag.id, environmentId: environment.id, enabled: state.enabled },
        update: { enabled: state.enabled },
      })
    }
  }

  reconcileFlags = async (
    projectId: string,
    flags: IUpsertFlagsmithFlagData[],
    tx: TxClient,
  ): Promise<void> => {
    const syncedAt = new Date()
    const incomingKeys = flags.map((flag) => flag.key)

    const environments = await tx.flagsmithEnvironment.findMany({
      where: { projectId },
      select: { id: true, name: true },
    })
    const environmentIdByName = new Map(environments.map((env) => [env.name, env.id]))

    const existing = await tx.flagsmithFlag.findMany({
      where: { projectId },
      select: { id: true, key: true, flagCreatedAt: true },
    })
    const existingByKey = new Map(existing.map((flag) => [flag.key, flag]))

    const toCreate = flags.filter((flag) => !existingByKey.has(flag.key))
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
        return [{ flagId, environmentId, enabled: state.enabled }]
      })
    })
    if (stateRows.length > 0) {
      await tx.flagsmithFlagState.createMany({ data: stateRows })
    }
  }

  softDeleteFlagsNotInKeys = async (projectId: string, keys: string[], tx: TxClient): Promise<void> => {
    await tx.flagsmithFlag.updateMany({
      where: { projectId, deletedAt: null, key: { notIn: keys } },
      data: { deletedAt: new Date() },
    })
  }

  softDeleteFlagByKey = async (projectId: string, key: string, tx: TxClient): Promise<void> => {
    await tx.flagsmithFlag.updateMany({
      where: { projectId, key, deletedAt: null },
      data: { deletedAt: new Date() },
    })
  }

  findFlagMatrix = async (
    filters: IFlagsmithFlagMatrixFilters,
    tx: TxClient,
  ): Promise<IFlagsmithFlagMatrixResult> => {
    const environmentRows = await tx.flagsmithEnvironment.findMany({
      where: { projectId: filters.projectId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    })
    const environments = environmentRows.map((env) => env.name)

    const latestSyncRun = await tx.flagsmithSyncRun.findFirst({
      where: { projectId: filters.projectId, status: FlagsmithSyncStatus.completed },
      orderBy: { finishedAt: 'desc' },
      select: { finishedAt: true },
    })
    const lastSyncedAt = latestSyncRun?.finishedAt ?? null

    if (environments.length === 0) {
      return { environments: [], totalCount: 0, items: [], lastSyncedAt }
    }

    let countQuery = kysely
      .selectFrom('flagsmith_flags')
      .select(({ fn }) => fn.countAll<string>().as('total'))
      .where('project_id', '=', filters.projectId)
      .where('deleted_at', 'is', null)

    if (filters.search) {
      countQuery = countQuery.where('key', 'ilike', `%${filters.search}%`)
    }

    const compiledCount = countQuery.compile()
    const countRows = await tx.$queryRawUnsafe<{ total: string }[]>(
      compiledCount.sql,
      ...compiledCount.parameters,
    )
    const totalCount = Number(countRows[0]?.total ?? 0)

    let rowsQuery = kysely
      .selectFrom('flagsmith_flags as flag')
      .leftJoin('flagsmith_flag_states as state', 'state.flag_id', 'flag.id')
      .leftJoin('flagsmith_environments as env', 'env.id', 'state.environment_id')
      .select([
        'flag.id as flagId',
        'flag.key as key',
        'flag.flag_created_at as createdAt',
        'env.name as environmentName',
        'state.enabled as enabled',
      ])
      .where('flag.project_id', '=', filters.projectId)
      .where('flag.deleted_at', 'is', null)

    if (filters.search) {
      rowsQuery = rowsQuery.where('flag.key', 'ilike', `%${filters.search}%`)
    }

    const sortEnvironmentId = await this.resolveSortEnvironmentId(filters, tx)
    const pagedFlagIdsQuery = this.buildPagedFlagIdsQuery(filters, sortEnvironmentId)
    const compiledPagedIds = pagedFlagIdsQuery.compile()
    const pagedIdRows = await tx.$queryRawUnsafe<{ id: string }[]>(
      compiledPagedIds.sql,
      ...compiledPagedIds.parameters,
    )
    const pagedFlagIds = pagedIdRows.map((row) => row.id)

    if (pagedFlagIds.length === 0) {
      return { environments, totalCount, items: [], lastSyncedAt }
    }

    rowsQuery = rowsQuery.where('flag.id', 'in', pagedFlagIds)

    const compiledRows = rowsQuery.compile()
    const rows = await tx.$queryRawUnsafe<
      { flagId: string; key: string; createdAt: Date | null; environmentName: string | null; enabled: boolean | null }[]
    >(compiledRows.sql, ...compiledRows.parameters)

    const flagOrder = new Map(pagedFlagIds.map((id, index) => [id, index]))
    const flagsByOrder = new Map<string, IFlagsmithFlagRecord & { flagId: string }>()

    for (const row of rows) {
      const existing = flagsByOrder.get(row.flagId)
      const record = existing ?? { flagId: row.flagId, key: row.key, createdAt: row.createdAt, states: [] }
      if (row.environmentName !== null) {
        record.states.push({ environmentName: row.environmentName, enabled: row.enabled ?? false })
      }
      flagsByOrder.set(row.flagId, record)
    }

    const items: IFlagsmithFlagRecord[] = [...flagsByOrder.values()]
      .sort((a, b) => (flagOrder.get(a.flagId) ?? 0) - (flagOrder.get(b.flagId) ?? 0))
      .map((record) => {
        const stateByEnv = new Map(record.states.map((state) => [state.environmentName, state.enabled]))
        return {
          key: record.key,
          createdAt: record.createdAt,
          states: environments.map((name) => ({
            environmentName: name,
            enabled: stateByEnv.get(name) ?? false,
          })),
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
        states: { select: { enabled: true, environment: { select: { name: true } } } },
      },
    })

    const flags: IFlagsmithFlagRecord[] = rows.map((row) => {
      const stateByEnv = new Map(row.states.map((state) => [state.environment.name, state.enabled]))
      return {
        key: row.key,
        createdAt: row.flagCreatedAt,
        states: environments.map((name) => ({ environmentName: name, enabled: stateByEnv.get(name) ?? false })),
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

  private buildPagedFlagIdsQuery(filters: IFlagsmithFlagMatrixFilters, sortEnvironmentId: string | null) {
    const direction = filters.sortDirection === SortDirection.ASC ? 'asc' : 'desc'

    let query = kysely
      .selectFrom('flagsmith_flags as flag')
      .select('flag.id as id')
      .where('flag.project_id', '=', filters.projectId)
      .where('flag.deleted_at', 'is', null)

    if (filters.search) {
      query = query.where('flag.key', 'ilike', `%${filters.search}%`)
    }

    if (filters.sortField === FlagSortField.NAME) {
      return query.orderBy('flag.key', direction).limit(filters.limit).offset(filters.offset)
    }

    if (filters.sortField === FlagSortField.ENVIRONMENT && sortEnvironmentId) {
      return query
        .leftJoin('flagsmith_flag_states as sort_state', (join) =>
          join
            .onRef('sort_state.flag_id', '=', 'flag.id')
            .on('sort_state.environment_id', '=', sortEnvironmentId),
        )
        .orderBy(sql`coalesce(sort_state.enabled, false)`, direction)
        .orderBy('flag.key', 'asc')
        .limit(filters.limit)
        .offset(filters.offset)
    }

    return query
      .orderBy('flag.flag_created_at', direction)
      .orderBy('flag.key', 'asc')
      .limit(filters.limit)
      .offset(filters.offset)
  }
}
