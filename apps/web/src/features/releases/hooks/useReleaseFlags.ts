import { useQuery } from '@apollo/client/react'
import { RELEASE_FLAGS } from '../graphql/releases.queries'

export function useReleaseFlags(releaseId: string) {
  const { data, loading, error, refetch } = useQuery(RELEASE_FLAGS, {
    variables: { releaseId },
    fetchPolicy: 'cache-and-network',
  })

  return {
    flags: data?.releaseFlags ?? [],
    loading,
    error,
    refetch,
  }
}
