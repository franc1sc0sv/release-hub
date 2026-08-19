import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SyncFlagsmithFlagsMutation } from '@/generated/graphql'

type FlagSyncReport = SyncFlagsmithFlagsMutation['syncFlagsmithFlags']
type FlagSyncDrift = FlagSyncReport['enabledChanges'][number]

const EnabledDriftText = {
  ON: String(true),
  OFF: String(false),
} as const

const MISSING_VALUE = '—'

interface DriftColumnLabels {
  flag: string
  environment: string
  previous: string
  next: string
}

interface FlagSyncReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: FlagSyncReport | null
}

interface ReportSectionProps {
  heading: string
  count: number
  children: ReactNode
}

function ReportSection({ heading, count, children }: ReportSectionProps) {
  return (
    <section aria-label={heading}>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}

function KeyChipList({ values }: { values: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {values.map((value) => (
        <li
          key={value}
          className="rounded-full border border-border/60 bg-card px-2.5 py-1 font-mono text-xs text-foreground"
        >
          {value}
        </li>
      ))}
    </ul>
  )
}

interface DriftTableProps {
  rows: readonly FlagSyncDrift[]
  labels: DriftColumnLabels
  formatValue: (value: string | null) => string
}

function DriftTable({ rows, labels, formatValue }: DriftTableProps) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-card/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              {labels.flag}
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              {labels.environment}
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              {labels.previous}
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">
              {labels.next}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.flagKey}::${row.environmentName}`}>
              <TableCell className="font-mono text-xs font-medium text-foreground">
                {row.flagKey}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {row.environmentName}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatValue(row.previousValue)}
              </TableCell>
              <TableCell className="font-mono text-xs text-foreground">
                {formatValue(row.newValue)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function FlagSyncReportDialog({
  open,
  onOpenChange,
  report,
}: FlagSyncReportDialogProps) {
  const { t } = useTranslation('flags')

  const columnLabels: DriftColumnLabels = {
    flag: t('sync.report.columnFlag'),
    environment: t('sync.report.columnEnvironment'),
    previous: t('sync.report.columnPrevious'),
    next: t('sync.report.columnNew'),
  }

  function formatRawValue(value: string | null): string {
    return value ?? MISSING_VALUE
  }

  function formatEnabledValue(value: string | null): string {
    if (value === EnabledDriftText.ON) return t('state.on')
    if (value === EnabledDriftText.OFF) return t('state.off')
    return formatRawValue(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('sync.report.title')}</DialogTitle>
          {report && (
            <DialogDescription>
              {t('sync.report.checkedCount', { count: report.flagCount })}
            </DialogDescription>
          )}
        </DialogHeader>

        {report && (
          <div
            role="region"
            tabIndex={0}
            aria-label={t('sync.report.title')}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            {report.inSync ? (
              <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border/60 bg-card/50 px-4 py-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-indigo-bright/20">
                  <CheckCircle2 className="size-5 text-brand-indigo-bright" aria-hidden />
                </span>
                <p className="text-sm text-foreground">{t('sync.report.inSync')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">{t('sync.report.driftHeading')}</p>

                {report.addedKeys.length > 0 && (
                  <ReportSection
                    heading={t('sync.report.flagsAdded')}
                    count={report.addedKeys.length}
                  >
                    <KeyChipList values={report.addedKeys} />
                  </ReportSection>
                )}

                {report.removedKeys.length > 0 && (
                  <ReportSection
                    heading={t('sync.report.flagsRemoved')}
                    count={report.removedKeys.length}
                  >
                    <KeyChipList values={report.removedKeys} />
                  </ReportSection>
                )}

                {report.environmentsAdded.length > 0 && (
                  <ReportSection
                    heading={t('sync.report.environmentsAdded')}
                    count={report.environmentsAdded.length}
                  >
                    <KeyChipList values={report.environmentsAdded} />
                  </ReportSection>
                )}

                {report.enabledChanges.length > 0 && (
                  <ReportSection
                    heading={t('sync.report.enabledChanges')}
                    count={report.enabledChanges.length}
                  >
                    <DriftTable
                      rows={report.enabledChanges}
                      labels={columnLabels}
                      formatValue={formatEnabledValue}
                    />
                  </ReportSection>
                )}

                {report.valueChanges.length > 0 && (
                  <ReportSection
                    heading={t('sync.report.valueChanges')}
                    count={report.valueChanges.length}
                  >
                    <DriftTable
                      rows={report.valueChanges}
                      labels={columnLabels}
                      formatValue={formatRawValue}
                    />
                  </ReportSection>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('sync.report.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
