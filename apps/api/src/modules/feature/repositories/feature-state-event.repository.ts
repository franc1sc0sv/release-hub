import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { IFeatureStateEventRepository } from '../interfaces/feature-state-event.repository'
import type { IFeatureStateEvent, ICreateFeatureStateEventData } from '../interfaces/feature.interfaces'
import type { FeatureState } from '../../../common/types/feature-state.enum'
import type {
  FeatureTimelineScope,
  FeatureTimelineSource,
} from '../../../common/types/feature-timeline.enum'

interface IFeatureStateEventRow {
  id: string
  featureId: string
  releaseId: string | null
  scope: string
  source: string
  fromState: string | null
  toState: string
  actorId: string | null
  flagKey: string | null
  occurredAt: Date
  actor: { name: string } | null
  release: { name: string | null; compareRef: string } | null
}

const EVENT_RELATIONS = {
  actor: { select: { name: true } },
  release: { select: { name: true, compareRef: true } },
} as const

@Injectable()
export class FeatureStateEventRepository extends IFeatureStateEventRepository {
  findById = async (id: string, tx: TxClient): Promise<IFeatureStateEvent | null> => {
    const row = await tx.featureStateEvent.findFirst({ where: { id }, include: EVENT_RELATIONS })
    if (!row) return null
    return this.toIFeatureStateEvent(row)
  }

  findAllByFeature = async (featureId: string, tx: TxClient): Promise<IFeatureStateEvent[]> => {
    const rows = await tx.featureStateEvent.findMany({
      where: { featureId },
      include: EVENT_RELATIONS,
      orderBy: { occurredAt: 'desc' },
    })
    return rows.map((row) => this.toIFeatureStateEvent(row))
  }

  create = async (
    data: ICreateFeatureStateEventData,
    tx: TxClient,
  ): Promise<IFeatureStateEvent> => {
    const row = await tx.featureStateEvent.create({
      data: {
        featureId: data.featureId,
        releaseId: data.releaseId,
        scope: data.scope,
        source: data.source,
        fromState: data.fromState,
        toState: data.toState,
        actorId: data.actorId,
        flagKey: data.flagKey,
      },
      include: EVENT_RELATIONS,
    })
    return this.toIFeatureStateEvent(row)
  }

  private toIFeatureStateEvent(row: IFeatureStateEventRow): IFeatureStateEvent {
    return {
      id: row.id,
      featureId: row.featureId,
      releaseId: row.releaseId,
      scope: row.scope as FeatureTimelineScope,
      source: row.source as FeatureTimelineSource,
      fromState: row.fromState as FeatureState | null,
      toState: row.toState as FeatureState,
      actorId: row.actorId,
      actorName: row.actor?.name ?? null,
      releaseName: row.release ? (row.release.name ?? row.release.compareRef) : null,
      flagKey: row.flagKey,
      occurredAt: row.occurredAt,
    }
  }
}
