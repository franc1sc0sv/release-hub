import { useLazyQuery } from '@apollo/client/react'
import { COMPARE_FLAGS } from '../graphql/flags.queries'

export function useCompareFlags() {
  const [execute, { data, loading, error, called }] = useLazyQuery(COMPARE_FLAGS, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  function compare(
    projectId: string,
    baselineEnvironments: string[],
    comparedEnvironments: string[],
  ) {
    execute({ variables: { projectId, baselineEnvironments, comparedEnvironments } })
  }

  return {
    compare,
    baselineEnvironments: data?.compareFlags.baselineEnvironments ?? [],
    comparedEnvironments: data?.compareFlags.comparedEnvironments ?? [],
    items: data?.compareFlags.items ?? [],
    loading,
    called,
    error: error ?? null,
  }
}
