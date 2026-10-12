import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Copy, FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { copyRichText } from '@/lib/copy-rich-text'
import { buildSummaryClipboard, exportSummaryDocumentPdf, summaryPdfFilename } from '../lib/summary-export'

interface SummaryExportControlsProps {
  releaseName: string
  html: string
  hasSummary: boolean
}

export function SummaryExportControls({ releaseName, html, hasSummary }: SummaryExportControlsProps) {
  const { t } = useTranslation('releases')
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await exportSummaryDocumentPdf(
        {
          releaseName,
          html,
          generatedAtIso: new Date().toISOString(),
          labels: {
            brand: t('export.brand'),
            reportTitle: t('export.reportTitle'),
            generatedLabel: t('export.generatedLabel'),
          },
        },
        summaryPdfFilename(releaseName),
      )
    } catch {
      toast.error(t('export.downloadFailed'))
    } finally {
      setExporting(false)
    }
  }

  async function handleCopy() {
    const clipboard = buildSummaryClipboard(releaseName, html)
    try {
      await copyRichText(clipboard.html, clipboard.text)
      toast.success(t('export.copied'))
    } catch {
      toast.error(t('export.copyFailed'))
    }
  }

  const isActuallyDisabled = !hasSummary && !exporting

  if (isActuallyDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>
            <div className="pointer-events-none flex items-center gap-2 opacity-50">
              <Button variant="outline" size="sm" aria-disabled tabIndex={-1}>
                <Copy className="mr-1.5 size-3.5" aria-hidden />
                {t('export.copy')}
              </Button>
              <Button variant="outline" size="sm" aria-disabled tabIndex={-1}>
                <FileDown className="mr-1.5 size-3.5" aria-hidden />
                {t('export.pdf')}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>{t('export.noSummary')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
        <Copy className="mr-1.5 size-3.5" aria-hidden />
        {t('export.copy')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
        aria-label={exporting ? t('export.exporting') : t('export.pdf')}
      >
        {exporting ? (
          <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden />
        ) : (
          <FileDown className="mr-1.5 size-3.5" aria-hidden />
        )}
        {exporting ? t('export.exporting') : t('export.pdf')}
      </Button>
    </div>
  )
}
