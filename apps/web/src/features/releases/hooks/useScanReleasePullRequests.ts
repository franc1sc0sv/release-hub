import { useMutation } from '@apollo/client/react'
import { SCAN_RELEASE_PULL_REQUESTS } from '../graphql/releases.mutations'
import { RELEASE_FLAGS } from '../graphql/releases.queries'

export function useScanReleasePullRequests(releaseId: string) {
  const [scanReleasePullRequests, { loading }] = useMutation(SCAN_RELEASE_PULL_REQUESTS, {
    refetchQueries: [{ query: RELEASE_FLAGS, variables: { releaseId } }],
    awaitRefetchQueries: true,
  })

  async function run() {
    return scanReleasePullRequests({ variables: { releaseId } })
  }

  return { run, loading }
}
