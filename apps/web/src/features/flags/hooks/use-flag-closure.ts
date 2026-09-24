import { useMutation } from '@apollo/client/react'
import { CLOSE_TRACKED_FLAG, REOPEN_TRACKED_FLAG } from '../graphql/flags.mutations'
import type { FlagClosedReason } from '@/generated/graphql'

const CLOSURE_REFETCH_QUERIES = ['GetFlagDetail', 'GetFlagHistory', 'CarriedOverFlags', 'ReleaseFlags']

export function useFlagClosure(projectId: string, flagKey: string) {
  const [closeMutation, { loading: closing }] = useMutation(CLOSE_TRACKED_FLAG, {
    refetchQueries: CLOSURE_REFETCH_QUERIES,
    awaitRefetchQueries: true,
  })
  const [reopenMutation, { loading: reopening }] = useMutation(REOPEN_TRACKED_FLAG, {
    refetchQueries: CLOSURE_REFETCH_QUERIES,
    awaitRefetchQueries: true,
  })

  async function close(reason: FlagClosedReason) {
    return closeMutation({ variables: { input: { projectId, key: flagKey, reason } } })
  }

  async function reopen() {
    return reopenMutation({ variables: { projectId, key: flagKey } })
  }

  return { close, reopen, pending: closing || reopening }
}
