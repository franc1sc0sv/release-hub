import { useQuery } from '@apollo/client/react'
import { UNREAD_NOTIFICATIONS_COUNT } from '../graphql/notifications.queries'

const POLL_INTERVAL_MS = 60000

export function useUnreadNotificationsCount() {
  const { data, refetch } = useQuery(UNREAD_NOTIFICATIONS_COUNT, {
    pollInterval: POLL_INTERVAL_MS,
    fetchPolicy: 'cache-and-network',
  })

  return {
    unreadCount: data?.unreadNotificationsCount ?? 0,
    refetch,
  }
}
