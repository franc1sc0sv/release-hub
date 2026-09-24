import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { useEnumLabels } from '@/hooks/use-enum-labels'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Can } from '@/context/ability.context'
import { Action, Subject } from '@release-hub/shared'
import { SET_RELEASE_STATUS } from '../graphql/releases.mutations'
import {
  RELEASE_STATUS_TEXT_CLASS,
  RELEASE_STATUS_BADGE_CLASS,
} from '../constants/release-enums'
import type { ReleaseStatus } from '@/generated/graphql'

interface ReleaseStatusControlProps {
  releaseId: string
  currentStatus: ReleaseStatus
  allowedNextStatuses: ReleaseStatus[]
}

function StatusSelectInner({ releaseId, currentStatus, allowedNextStatuses }: ReleaseStatusControlProps) {
  const { t } = useTranslation('releases')
  const enumLabels = useEnumLabels()
  const [optimisticStatus, setOptimisticStatus] = useState<ReleaseStatus>(currentStatus)

  const [setReleaseStatus] = useMutation(SET_RELEASE_STATUS)
  const options = [currentStatus, ...allowedNextStatuses]

  async function handleChange(value: string | null) {
    const newStatus = options.find((option) => option === value)
    if (!newStatus || newStatus === optimisticStatus) return
    const previousStatus = optimisticStatus

    setOptimisticStatus(newStatus)

    try {
      await setReleaseStatus({ variables: { input: { releaseId, status: newStatus } } })
      toast.success(t('toast.statusChanged'))
    } catch (error) {
      setOptimisticStatus(previousStatus)
      toast.error(error instanceof Error && error.message ? error.message : t('toast.statusError'))
    }
  }

  return (
    <Select value={optimisticStatus} onValueChange={(v) => handleChange(v)}>
      <SelectTrigger
        className={`h-auto rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium focus-visible:ring-ring ${RELEASE_STATUS_TEXT_CLASS[optimisticStatus]}`}
        aria-label={t('status.label')}
      >
        <SelectValue>
          {(value: string) => (value ? enumLabels.releaseStatus(value as ReleaseStatus) : null)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-[var(--radius-card)] border border-white/15 bg-popover">
        {options.map((status) => (
          <SelectItem
            key={status}
            value={status}
            className={`rounded-xl text-xs ${RELEASE_STATUS_TEXT_CLASS[status]}`}
          >
            {enumLabels.releaseStatus(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ReadOnlyStatusBadge({ status }: { status: ReleaseStatus }) {
  const enumLabels = useEnumLabels()
  return (
    <Badge variant="outline" className={`rounded-full border ${RELEASE_STATUS_BADGE_CLASS[status]}`}>
      {enumLabels.releaseStatus(status)}
    </Badge>
  )
}

export function ReleaseStatusControl(props: ReleaseStatusControlProps) {
  const isLocked = props.allowedNextStatuses.length === 0

  return (
    <Can I={Action.UPDATE} a={Subject.RELEASE} passThrough>
      {(allowed) =>
        allowed && !isLocked ? (
          <StatusSelectInner {...props} />
        ) : (
          <ReadOnlyStatusBadge status={props.currentStatus} />
        )
      }
    </Can>
  )
}
