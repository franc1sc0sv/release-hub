import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { ChevronDown, Loader2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Action, Subject } from '@release-hub/shared'
import { Can } from '@/context/ability.context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DisabledTooltip } from '@/components/DisabledTooltip'
import { isAiEnabled } from '@/lib/ai-availability'
import { REGENERATE_DRAFT } from '../graphql/releases.mutations'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'
import { AiDraftStatusValue } from '../constants/release-enums'

interface RegenerateDraftButtonProps {
  releaseId: string
  aiDraftStatus: string
}

export function RegenerateDraftButton({
  releaseId,
  aiDraftStatus,
}: RegenerateDraftButtonProps) {
  const { t } = useTranslation('releases')
  const { t: tAi } = useTranslation('ai')
  const aiEnabled = isAiEnabled()

  const isRunning =
    aiDraftStatus === AiDraftStatusValue.PENDING ||
    aiDraftStatus === AiDraftStatusValue.RUNNING

  const [regenerateDraft, { loading }] = useMutation(REGENERATE_DRAFT, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }],
    onError: () => {
      toast.error(t('draft.regenerateError'))
    },
  })

  const handleRegenerate = useCallback(
    (resume: boolean) => {
      regenerateDraft({ variables: { releaseId, resume } })
    },
    [regenerateDraft, releaseId],
  )

  const disabled = isRunning || loading

  if (!aiEnabled) {
    return (
      <Can I={Action.UPDATE} a={Subject.RELEASE}>
        <DisabledTooltip tooltip={tAi('unavailable.tooltip')}>
          <Button
            variant="outline"
            size="sm"
            aria-disabled
            tabIndex={-1}
            aria-label={t('draft.regenerate')}
            className="pointer-events-none gap-1.5 opacity-50"
          >
            <RefreshCcw className="size-3.5" aria-hidden />
            {t('draft.regenerate')}
          </Button>
        </DisabledTooltip>
      </Can>
    )
  }

  return (
    <Can I={Action.UPDATE} a={Subject.RELEASE}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              aria-label={t('draft.regenerate')}
              className="gap-1.5"
            >
              {disabled ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <RefreshCcw className="size-3.5" aria-hidden />
              )}
              {t('draft.regenerate')}
              <ChevronDown className="size-3 opacity-60" aria-hidden />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleRegenerate(false)}>
            {t('draft.regenerateFromScratch')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRegenerate(true)}>
            {t('draft.regenerateResume')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Can>
  )
}
