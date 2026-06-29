import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLazyQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EXPORT_SUMMARY } from '../graphql/releases.queries'
import type { ExportFormat } from '@/generated/graphql'

const ExportFormatValue = {
  MD: 'MD',
  PDF: 'PDF',
} as const satisfies Record<ExportFormat, ExportFormat>

interface SummaryExportControlsProps {
  releaseId: string
  hasSummary: boolean
}

export function SummaryExportControls({ releaseId, hasSummary }: SummaryExportControlsProps) {
  const { t } = useTranslation('releases')
  const [exportingMd, setExportingMd] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const [exportSummary] = useLazyQuery(EXPORT_SUMMARY)

  async function triggerExport(format: ExportFormat) {
    const isMd = format === ExportFormatValue.MD
    if (isMd) setExportingMd(true)
    else setExportingPdf(true)

    try {
      const { data } = await exportSummary({
        variables: { input: { releaseId, format } },
      })
      if (!data) {
        toast.error(t('export.downloadFailed'))
        return
      }
      const anchor = document.createElement('a')
      anchor.href = data.exportSummary.url
      anchor.download = data.exportSummary.filename
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    } catch {
      toast.error(t('export.downloadFailed'))
    } finally {
      if (isMd) setExportingMd(false)
      else setExportingPdf(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <ExportButton
          label={t('export.markdown')}
          loadingLabel={t('export.exporting')}
          disabledTooltip={t('export.noSummary')}
          loading={exportingMd}
          disabled={!hasSummary || exportingPdf}
          onClick={() => triggerExport(ExportFormatValue.MD)}
        />
        <ExportButton
          label={t('export.pdf')}
          loadingLabel={t('export.exporting')}
          disabledTooltip={t('export.noSummary')}
          loading={exportingPdf}
          disabled={!hasSummary || exportingMd}
          onClick={() => triggerExport(ExportFormatValue.PDF)}
        />
      </div>
    </TooltipProvider>
  )
}

interface ExportButtonProps {
  label: string
  loadingLabel: string
  disabledTooltip: string
  loading: boolean
  disabled: boolean
  onClick: () => void
}

function ExportButton({
  label,
  loadingLabel,
  disabledTooltip,
  loading,
  disabled,
  onClick,
}: ExportButtonProps) {
  const isActuallyDisabled = disabled && !loading

  if (isActuallyDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span tabIndex={0} className="inline-flex" />}>
          <Button
            variant="outline"
            aria-disabled
            tabIndex={-1}
            className="pointer-events-none opacity-50"
          >
            <FileDown className="mr-2 size-4" aria-hidden />
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{disabledTooltip}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading}
      aria-label={loading ? loadingLabel : label}
    >
      {loading ? (
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
      ) : (
        <FileDown className="mr-2 size-4" aria-hidden />
      )}
      {loading ? loadingLabel : label}
    </Button>
  )
}
