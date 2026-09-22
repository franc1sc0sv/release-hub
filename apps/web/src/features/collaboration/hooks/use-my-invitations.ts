import { useQuery } from '@apollo/client/react'
import { MY_INVITATIONS } from '../graphql/collaboration.operations'

const POLL_INTERVAL_MS = 60000

export function useMyInvitations() {
  const { data, loading } = useQuery(MY_INVITATIONS, {
    pollInterval: POLL_INTERVAL_MS,
    fetchPolicy: 'cache-and-network',
  })

  return {
    invitations: data?.myInvitations ?? [],
    loading,
  }
}
