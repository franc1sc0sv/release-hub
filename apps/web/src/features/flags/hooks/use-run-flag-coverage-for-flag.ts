import { useMutation } from '@apollo/client/react'
import { RUN_FLAG_COVERAGE_FOR_FLAG } from '../graphql/flags.mutations'
import { TRACKED_FLAG } from '../graphql/flags.queries'

export function useRunFlagCoverageForFlag(projectId: string, flagKey: string) {
  const [runFlagCoverageForFlag, { loading }] = useMutation(RUN_FLAG_COVERAGE_FOR_FLAG, {
    refetchQueries: [{ query: TRACKED_FLAG, variables: { projectId, key: flagKey } }],
    awaitRefetchQueries: true,
  })

  async function run() {
    return runFlagCoverageForFlag({ variables: { projectId, key: flagKey } })
  }

  return { run, loading }
}
