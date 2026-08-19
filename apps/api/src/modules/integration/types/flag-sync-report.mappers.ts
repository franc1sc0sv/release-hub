import type { IFlagSyncReport } from '../interfaces/flagsmith-sync.interfaces'
import { FlagSyncDriftType, FlagSyncReportType } from './flag-sync-report.type'

function toDrift(
  flagKey: string,
  environmentName: string,
  previousValue: string | null,
  newValue: string | null,
): FlagSyncDriftType {
  return Object.assign(new FlagSyncDriftType(), { flagKey, environmentName, previousValue, newValue })
}

export function toFlagSyncReport(report: IFlagSyncReport): FlagSyncReportType {
  const enabledChanges = report.enabledChanges.map((change) =>
    toDrift(change.key, change.environmentName, String(change.previousEnabled), String(change.newEnabled)),
  )
  const valueChanges = report.valueChanges.map((change) =>
    toDrift(change.key, change.environmentName, change.previousValue, change.newValue),
  )
  const driftLists: ReadonlyArray<ReadonlyArray<unknown>> = [
    report.addedKeys,
    report.removedKeys,
    report.environmentsAdded,
    enabledChanges,
    valueChanges,
  ]

  return Object.assign(new FlagSyncReportType(), {
    flagCount: report.flagCount,
    addedKeys: report.addedKeys,
    removedKeys: report.removedKeys,
    environmentsAdded: report.environmentsAdded,
    enabledChanges,
    valueChanges,
    inSync: driftLists.every((list) => list.length === 0),
    syncedAt: new Date(),
  })
}
