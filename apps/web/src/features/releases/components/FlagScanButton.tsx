import { useTranslation } from 'react-i18next'
import { Loader2, RadarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { useScanReleasePullRequests } from '../hooks/useScanReleasePullRequests'

interface FlagScanButtonProps {
  releaseId: string
}

export function FlagScanButton({ releaseId }: FlagScanButtonProps) {
  const { t } = useTranslation('releases')
  const { run, loading } = useScanReleasePullRequests(releaseId)

  async function handleScan(): Promise<void> {
    try {
      const result = await run()
      const summary = result.data?.scanReleasePullRequests
      if (summary) {
        toast.success(
          t('flags.scan.success', {
            prsScanned: summary.prsScanned,
            flagsFound: summary.flagsFound,
            changesRecorded: summary.changesRecorded,
          }),
        )
      }
    } catch {
      toast.error(t('flags.scan.error'))
    }
  }

  return (
    <Can I={Action.UPDATE} a={Subject.RELEASE}>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full gap-2"
        disabled={loading}
        onClick={() => void handleScan()}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RadarIcon className="size-4" aria-hidden />
        )}
        {t('flags.scan.button')}
      </Button>
    </Can>
  )
}
