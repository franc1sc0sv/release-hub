import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Copy, FileDown, FileText, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SummaryDocument } from './SummaryDocument'
import { exportSummaryDocumentPdf, reportPdfFilename } from '../lib/summary-export'
import {
  ShippedOffAudienceValue,
  buildClientShippedOffReport,
  buildInternalShippedOffReport,
} from '../lib/shipped-off-report'
import type { ShippedOffAudience } from '../lib/shipped-off-report'
import type { CarriedOverFlagsQuery } from '@/generated/graphql'

type CarriedOverFlag = CarriedOverFlagsQuery['carriedOverFlags'][number]

const AUDIENCE_OPTIONS: ShippedOffAudience[] = [ShippedOffAudienceValue.CLIENT, ShippedOffAudienceValue.INTERNAL]

interface ShippedOffReportDialogProps {
  releaseName: string
  flags: CarriedOverFlag[]
}

async function copyReport(html: string, text: string) {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ])
    return
  }
  await navigator.clipboard.writeText(text)
}

export function ShippedOffReportDialog({ releaseName, flags }: ShippedOffReportDialogProps) {
  const { t } = useTranslation('releases')
  const [audience, setAudience] = useState<ShippedOffAudience>(ShippedOffAudienceValue.CLIENT)
  const [exporting, setExporting] = useState(false)

  const report =
    audience === ShippedOffAudienceValue.CLIENT
      ? buildClientShippedOffReport(flags, {
          title: t('workspace.shippedOffReport.client.title', { release: releaseName }),
          intro: t('workspace.shippedOffReport.client.intro'),
          statusLine: t('workspace.shippedOffReport.client.statusLine'),
          otherGroup: t('workspace.shippedOffReport.client.otherGroup'),
          outro: t('workspace.shippedOffReport.client.outro'),
        })
      : buildInternalShippedOffReport(flags, {
          title: t('workspace.shippedOffReport.internal.title', { release: releaseName }),
          intro: t('workspace.shippedOffReport.internal.intro', { count: flags.length }),
          feature: t('workspace.shippedOffReport.internal.feature'),
          decidedIn: t('workspace.shippedOffReport.internal.decidedIn'),
          pullRequest: t('workspace.shippedOffReport.internal.pullRequest'),
          noFeature: t('workspace.shippedOffReport.internal.noFeature'),
          noPullRequest: t('workspace.shippedOffReport.internal.noPullRequest'),
          thisRelease: t('workspace.shippedOffReport.internal.thisRelease'),
          featureDescription: t('workspace.shippedOffReport.internal.featureDescription'),
          flagDescription: t('workspace.shippedOffReport.internal.flagDescription'),
          noDescription: t('workspace.shippedOffReport.internal.noDescription'),
        })

  async function handleCopy() {
    try {
      await copyReport(report.html, report.text)
      toast.success(t('workspace.shippedOffReport.copied'))
    } catch {
      toast.error(t('workspace.shippedOffReport.copyFailed'))
    }
  }

  async function handleCopyForSlack() {
    try {
      await navigator.clipboard.writeText(report.slack)
      toast.success(t('workspace.shippedOffReport.copiedForSlack'))
    } catch {
      toast.error(t('workspace.shippedOffReport.copyFailed'))
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await exportSummaryDocumentPdf(
        {
          releaseName,
          html: report.html,
          generatedAtIso: new Date().toISOString(),
          labels: {
            brand: t('export.brand'),
            reportTitle: t(`workspace.shippedOffReport.pdfTitle.${audience}`),
            generatedLabel: t('export.generatedLabel'),
          },
        },
        reportPdfFilename(releaseName, `shipped-off-${audience}`),
      )
    } catch {
      toast.error(t('export.downloadFailed'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" disabled={flags.length === 0} />}>
        <FileText className="size-4" aria-hidden />
        {t('workspace.shippedOffReport.button', { count: flags.length })}
      </DialogTrigger>
      <DialogContent className="flex max-h-[88vh] flex-col gap-4 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('workspace.shippedOffReport.dialogTitle')}</DialogTitle>
          <DialogDescription>{t('workspace.shippedOffReport.dialogDescription', { count: flags.length })}</DialogDescription>
        </DialogHeader>

        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          value={[audience]}
          onValueChange={(groupValue) => {
            const next = AUDIENCE_OPTIONS.find((option) => groupValue.includes(option))
            if (next) setAudience(next)
          }}
          aria-label={t('workspace.shippedOffReport.audienceLabel')}
        >
          {AUDIENCE_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              className="px-3 text-xs text-muted-foreground data-[pressed]:bg-brand-indigo-bright/20 data-[pressed]:text-foreground"
            >
              {t(`workspace.shippedOffReport.audience.${option}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <SummaryDocument html={report.html} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => void handleCopy()} className="gap-2">
            <Copy className="size-4" aria-hidden />
            {t('workspace.shippedOffReport.copy')}
          </Button>
          <Button variant="outline" onClick={() => void handleCopyForSlack()} className="gap-2">
            <MessageSquare className="size-4" aria-hidden />
            {t('workspace.shippedOffReport.copyForSlack')}
          </Button>
          <Button onClick={() => void handleExport()} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FileDown className="size-4" aria-hidden />}
            {exporting ? t('export.exporting') : t('export.pdf')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
