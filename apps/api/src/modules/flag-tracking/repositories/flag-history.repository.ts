import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IFlagHistoryRepository } from '../interfaces/flag-history.repository'
import type {
  ICreateFlagHistoryEventData,
  IFlagHistoryEvent,
  IFlagHistoryPageFilters,
  IFlagHistoryPage,
} from '../interfaces/flag-history.repository'

interface IFlagHistoryEventRow {
  id: string
  projectId: string
  flagKey: string
  trackedFlagId: string | null
  flagsmithFlagId: string | null
  type: IFlagHistoryEvent['type']
  environmentName: string | null
  previousValue: string | null
  newValue: string | null
  releaseId: string | null
  actorId: string | null
  branchName: string | null
  prNumber: number | null
  detectedFile: string | null
  source: IFlagHistoryEvent['source']
  occurredAt: Date
  release: { name: string | null; compareRef: string } | null
  actor: { name: string } | null
}

function toIFlagHistoryEvent(row: IFlagHistoryEventRow): IFlagHistoryEvent {
  return {
    id: row.id,
    projectId: row.projectId,
    flagKey: row.flagKey,
    trackedFlagId: row.trackedFlagId,
    flagsmithFlagId: row.flagsmithFlagId,
    type: row.type,
    environmentName: row.environmentName,
    previousValue: row.previousValue,
    newValue: row.newValue,
    releaseId: row.releaseId,
    releaseName: row.release ? (row.release.name ?? row.release.compareRef) : null,
    actorId: row.actorId,
    actorName: row.actor?.name ?? null,
    branchName: row.branchName,
    prNumber: row.prNumber,
    detectedFile: row.detectedFile,
    source: row.source,
    occurredAt: row.occurredAt,
  }
}

@Injectable()
export class FlagHistoryRepository extends IFlagHistoryRepository {
  findById = async (id: string, tx: TxClient): Promise<IFlagHistoryEvent | null> => {
    const row = await tx.flagHistoryEvent.findFirst({
      where: { id },
      include: {
        release: { select: { name: true, compareRef: true } },
        actor: { select: { name: true } },
      },
    })
    if (!row) return null
    return toIFlagHistoryEvent(row)
  }

  create = async (data: ICreateFlagHistoryEventData, tx: TxClient): Promise<IFlagHistoryEvent> => {
    const row = await tx.flagHistoryEvent.create({
      data: {
        projectId: data.projectId,
        flagKey: data.flagKey,
        trackedFlagId: data.trackedFlagId ?? null,
        flagsmithFlagId: data.flagsmithFlagId ?? null,
        type: data.type,
        environmentName: data.environmentName ?? null,
        previousValue: data.previousValue ?? null,
        newValue: data.newValue ?? null,
        releaseId: data.releaseId ?? null,
        actorId: data.actorId ?? null,
        branchName: data.branchName ?? null,
        prNumber: data.prNumber ?? null,
        detectedFile: data.detectedFile ?? null,
        source: data.source,
        occurredAt: data.occurredAt ?? new Date(),
      },
      include: {
        release: { select: { name: true, compareRef: true } },
        actor: { select: { name: true } },
      },
    })
    return toIFlagHistoryEvent(row)
  }

  createMany = async (data: ICreateFlagHistoryEventData[], tx: TxClient): Promise<void> => {
    if (data.length === 0) return
    await tx.flagHistoryEvent.createMany({
      data: data.map((event) => ({
        projectId: event.projectId,
        flagKey: event.flagKey,
        trackedFlagId: event.trackedFlagId ?? null,
        flagsmithFlagId: event.flagsmithFlagId ?? null,
        type: event.type,
        environmentName: event.environmentName ?? null,
        previousValue: event.previousValue ?? null,
        newValue: event.newValue ?? null,
        releaseId: event.releaseId ?? null,
        actorId: event.actorId ?? null,
        branchName: event.branchName ?? null,
        prNumber: event.prNumber ?? null,
        detectedFile: event.detectedFile ?? null,
        source: event.source,
        occurredAt: event.occurredAt ?? new Date(),
      })),
    })
  }

  findPage = async (filters: IFlagHistoryPageFilters, tx: TxClient): Promise<IFlagHistoryPage> => {
    const where = { projectId: filters.projectId, flagKey: filters.flagKey }

    const [totalCount, rows] = await Promise.all([
      tx.flagHistoryEvent.count({ where }),
      tx.flagHistoryEvent.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        take: filters.limit,
        skip: filters.offset,
        include: {
          release: { select: { name: true, compareRef: true } },
          actor: { select: { name: true } },
        },
      }),
    ])

    return { items: rows.map(toIFlagHistoryEvent), totalCount }
  }
}
