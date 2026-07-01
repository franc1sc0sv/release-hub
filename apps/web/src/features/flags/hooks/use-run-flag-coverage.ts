import { useMutation } from '@apollo/client/react'
import { RUN_FLAG_COVERAGE } from '../graphql/flags.mutations'
import { TRACKED_FLAGS } from '../graphql/flags.queries'

export function useRunFlagCoverage(projectId: string) {
  const [runFlagCoverage, { loading }] = useMutation(RUN_FLAG_COVERAGE, {
    refetchQueries: [{ query: TRACKED_FLAGS, variables: { projectId } }],
    awaitRefetchQueries: true,
  })

  async function run() {
    return runFlagCoverage({ variables: { projectId } })
  }

  return { run, loading }
}
