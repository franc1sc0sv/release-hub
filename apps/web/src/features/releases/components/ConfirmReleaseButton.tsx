import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { Loader2, Rocket } from 'lucide-react'
import { GradientButton } from '@/components/nebula/GradientButton'
import { DisabledTooltip } from '@/components/DisabledTooltip'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { CONFIRM_RELEASE } from '../graphql/releases.mutations'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'

interface ConfirmReleaseButtonProps {
  releaseId: string
  coverageReady: boolean
}

export function ConfirmReleaseButton({ releaseId, coverageReady }: ConfirmReleaseButtonProps) {
  const { t } = useTranslation('releases')
  const [confirmRelease, { loading }] = useMutation(CONFIRM_RELEASE, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }, 'ReleaseFlags', 'CarriedOverFlags'],
    awaitRefetchQueries: true,
  })

  async function handleConfirm() {
    try {
      await confirmRelease({ variables: { input: { releaseId } } })
      toast.success(t('draft.confirmed'))
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : t('draft.confirmError'))
    }
  }

  const button = (
    <GradientButton disabled={!coverageReady || loading} onClick={() => void handleConfirm()} className="gap-2">
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Rocket className="size-4" aria-hidden />
      )}
      {loading ? t('draft.confirming') : t('draft.confirm')}
    </GradientButton>
  )

  return (
    <Can I={Action.UPDATE} a={Subject.RELEASE}>
      {coverageReady ? button : <DisabledTooltip tooltip={t('coverage.blockedTooltip')}>{button}</DisabledTooltip>}
    </Can>
  )
}
