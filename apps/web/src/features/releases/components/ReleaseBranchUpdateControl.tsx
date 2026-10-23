import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GitMerge, Loader2, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { Action, Subject } from '@release-hub/shared'
import { Can } from '@/context/ability.context'
import { DisabledTooltip } from '@/components/DisabledTooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BranchUpdateMethodValue } from '../constants/release-enums'
import { useReleaseBranchUpdate } from '../hooks/useReleaseBranchUpdate'
import { BranchCombobox } from './BranchCombobox'

interface ReleaseBranchUpdateControlProps {
  releaseId: string
  projectId: string
}

function ReleaseBranchUpdateInner({ releaseId, projectId }: ReleaseBranchUpdateControlProps) {
  const { t } = useTranslation('releases')
  const [pickerOpen, setPickerOpen] = useState(false)
  const { status, running, savingSourceRef, runUpdate, changeSourceRef } =
    useReleaseBranchUpdate(releaseId)

  const handleUpdate = useCallback(async () => {
    try {
      const result = await runUpdate()
      if (result && result.commitsAdded > 0) {
        toast.success(
          t('branchUpdate.added', { count: result.commitsAdded, branch: result.sourceRef }),
        )
      } else {
        toast.success(t('branchUpdate.upToDateToast'))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('branchUpdate.error'))
    }
  }, [runUpdate, t])

  const handleSourceRefChange = useCallback(
    async (sourceRef: string) => {
      setPickerOpen(false)
      try {
        await changeSourceRef(sourceRef)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('branchUpdate.sourceRefError'))
      }
    },
    [changeSourceRef, t],
  )

  if (!status) return null

  const { sourceRef, behindBy, canFastForward, ownCommits, updateMethod, detected } = status
  const isRebaseBlocked =
    updateMethod === BranchUpdateMethodValue.REBASE && !canFastForward && behindBy > 0

  let disabledReason: string | null = null
  if (!sourceRef) {
    disabledReason = t('branchUpdate.selectParent')
  } else if (behindBy === 0) {
    disabledReason = t('branchUpdate.upToDate', { branch: sourceRef })
  } else if (isRebaseBlocked) {
    disabledReason = t('branchUpdate.rebaseBlocked', { count: ownCommits, branch: sourceRef })
  }

  const updateButton = (
    <Button
      variant="outline"
      size="sm"
      disabled={running || disabledReason !== null}
      onClick={handleUpdate}
      className="gap-1.5"
    >
      {running ? (
        <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" aria-hidden />
      ) : (
        <GitMerge className="size-3.5" aria-hidden />
      )}
      {sourceRef ? t('branchUpdate.button', { branch: sourceRef }) : t('branchUpdate.buttonNoParent')}
      {sourceRef && (
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {t('branchUpdate.behind', { count: behindBy })}
        </span>
      )}
    </Button>
  )

  return (
    <div className="flex items-center gap-1">
      {disabledReason && !running ? (
        <DisabledTooltip tooltip={disabledReason}>{updateButton}</DisabledTooltip>
      ) : (
        updateButton
      )}
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={t('branchUpdate.changeParent')}
              disabled={running || savingSourceRef}
            />
          }
        >
          <Settings2 className="size-3.5" aria-hidden />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-2">
          <Label htmlFor="release-parent-branch">{t('branchUpdate.parentLabel')}</Label>
          <BranchCombobox
            id="release-parent-branch"
            projectId={projectId}
            value={sourceRef ?? ''}
            onChange={handleSourceRefChange}
            placeholder={t('branchUpdate.parentPlaceholder')}
          />
          {detected && sourceRef && (
            <p className="text-xs text-muted-foreground">{t('branchUpdate.detectedHint')}</p>
          )}
        </PopoverContent>
      </Popover>
      {detected && sourceRef && (
        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
          {t('branchUpdate.detected')}
        </Badge>
      )}
    </div>
  )
}

export function ReleaseBranchUpdateControl(props: ReleaseBranchUpdateControlProps) {
  return (
    <Can I={Action.UPDATE} a={Subject.RELEASE}>
      <ReleaseBranchUpdateInner {...props} />
    </Can>
  )
}
