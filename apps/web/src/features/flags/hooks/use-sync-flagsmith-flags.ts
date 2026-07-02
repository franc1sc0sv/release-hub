import { useMutation } from '@apollo/client/react'
import { SYNC_FLAGSMITH_FLAGS } from '../graphql/flags.mutations'

export function useSyncFlagsmithFlags(projectId: string) {
  const [syncFlagsmithFlags, { loading }] = useMutation(SYNC_FLAGSMITH_FLAGS)

  async function sync() {
    return syncFlagsmithFlags({ variables: { projectId } })
  }

  return { sync, loading }
}
