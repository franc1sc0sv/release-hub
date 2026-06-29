import type { ExportFormat } from '../../types/export-summary.input'

export class ExportSummaryQuery {
  constructor(
    readonly userId: string,
    readonly releaseId: string,
    readonly format: ExportFormat,
  ) {}
}
