import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { GET_COVERAGE, GET_RELEASE_BRANCH_STATUS, GET_RELEASE_TREE } from '../graphql/releases.queries'
import {
  RESYNC_RELEASE_PULL_REQUESTS,
  SET_RELEASE_SOURCE_REF,
  UPDATE_RELEASE_BRANCH,
} from '../graphql/releases.mutations'

export function useReleaseBranchUpdate(releaseId: string) {
  const { data } = useQuery(GET_RELEASE_BRANCH_STATUS, {
    variables: { releaseId },
    fetchPolicy: 'cache-and-network',
  })

  const refetchStatus = { query: GET_RELEASE_BRANCH_STATUS, variables: { releaseId } }

  const [updateBranch, { loading: updating }] = useMutation(UPDATE_RELEASE_BRANCH, {
    refetchQueries: [refetchStatus],
  })
  const [resyncPullRequests, { loading: resyncing }] = useMutation(RESYNC_RELEASE_PULL_REQUESTS, {
    refetchQueries: [
      { query: GET_RELEASE_TREE, variables: { id: releaseId } },
      { query: GET_COVERAGE, variables: { releaseId } },
      refetchStatus,
    ],
  })
  const [setSourceRef, { loading: savingSourceRef }] = useMutation(SET_RELEASE_SOURCE_REF, {
    refetchQueries: [refetchStatus],
  })

  const runUpdate = useCallback(async () => {
    const { data: result } = await updateBranch({ variables: { input: { releaseId } } })
    const update = result?.updateReleaseBranch
    if (update && update.commitsAdded > 0) {
      await resyncPullRequests({ variables: { releaseId } })
    }
    return update
  }, [updateBranch, resyncPullRequests, releaseId])

  const changeSourceRef = useCallback(
    async (sourceRef: string) => {
      await setSourceRef({ variables: { input: { releaseId, sourceRef } } })
    },
    [setSourceRef, releaseId],
  )

  return {
    status: data?.releaseBranchStatus,
    running: updating || resyncing,
    savingSourceRef,
    runUpdate,
    changeSourceRef,
  }
}
