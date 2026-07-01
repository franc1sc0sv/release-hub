import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client/react'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Action, Subject } from '@release-hub/shared'
import { Can } from '@/context/ability.context'
import { Button } from '@/components/ui/button'
import { RESYNC_RELEASE_PULL_REQUESTS } from '../graphql/releases.mutations'
import { GET_RELEASE_TREE } from '../graphql/releases.queries'

interface SyncNewPrsButtonProps {
  releaseId: string
}

export function SyncNewPrsButton({ releaseId }: SyncNewPrsButtonProps) {
  const { t } = useTranslation('releases')

  const [resyncPullRequests, { loading }] = useMutation(RESYNC_RELEASE_PULL_REQUESTS, {
    refetchQueries: [{ query: GET_RELEASE_TREE, variables: { id: releaseId } }],
  })

  const handleSync = useCallback(async () => {
    try {
      const { data } = await resyncPullRequests({ variables: { releaseId } })
      const newPrsAdded = data?.resyncReleasePullRequests.newPrsAdded ?? 0
      if (newPrsAdded > 0) {
        toast.success(t('resync.added', { count: newPrsAdded }))
      } else {
        toast.success(t('resync.none'))
      }
    } catch {
      toast.error(t('resync.error'))
    }
  }, [resyncPullRequests, releaseId, t])

  return (
    <Can I={Action.UPDATE} a={Subject.RELEASE}>
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleSync}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-3.5" aria-hidden />
        )}
        {loading ? t('resync.syncing') : t('resync.syncButton')}
      </Button>
    </Can>
  )
}
