import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { SET_FLAG_STATES, DELETE_FLAGS } from '../graphql/flags.mutations'
import type { FlagWriteReportType } from '@/generated/graphql'
import type { FlagChangeTarget } from '../types/flag-change-target'

export type FlagWriteReport = Pick<FlagWriteReportType, 'succeeded' | 'failed'> & {
  results: Pick<FlagWriteReportType['results'][number], 'flagKey' | 'environmentName' | 'ok' | 'error'>[]
}

export function useFlagWriteActions(projectId: string) {
  const [report, setReport] = useState<FlagWriteReport | null>(null)
  const [setFlagStatesMutation, { loading: setLoading }] = useMutation(SET_FLAG_STATES)
  const [deleteFlagsMutation, { loading: deleteLoading }] = useMutation(DELETE_FLAGS)

  async function applyStates(targets: FlagChangeTarget[]): Promise<FlagWriteReport | null> {
    const { data } = await setFlagStatesMutation({
      variables: {
        input: {
          projectId,
          targets: targets.map((target) => ({
            flagKey: target.flagKey,
            environmentName: target.environmentName,
            enabled: target.nextEnabled,
          })),
        },
      },
    })
    const next = data?.setFlagStates ?? null
    setReport(next)
    return next
  }

  async function deleteFlags(flagKeys: string[]): Promise<FlagWriteReport | null> {
    const { data } = await deleteFlagsMutation({ variables: { input: { projectId, flagKeys } } })
    const next = data?.deleteFlags ?? null
    setReport(next)
    return next
  }

  function resetReport() {
    setReport(null)
  }

  return {
    applyStates,
    deleteFlags,
    resetReport,
    report,
    pending: setLoading || deleteLoading,
  }
}
