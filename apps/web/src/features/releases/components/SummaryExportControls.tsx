import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { exportSummaryDocumentPdf, summaryPdfFilename } from '../lib/summary-export'

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

  const isActuallyDisabled = !hasSummary && !exporting

  if (isActuallyDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>
            <Button
              variant="outline"
              size="sm"
              aria-disabled
              tabIndex={-1}
              className="pointer-events-none opacity-50"
            >
              <FileDown className="mr-1.5 size-3.5" aria-hidden />
              {t('export.pdf')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('export.noSummary')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
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
  )
}
