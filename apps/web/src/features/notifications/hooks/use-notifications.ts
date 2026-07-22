import { useEffect, useState } from 'react'
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { NOTIFICATIONS } from '../graphql/notifications.queries'
import {
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  CLEAR_ALL_NOTIFICATIONS,
} from '../graphql/notifications.mutations'
import type { NotificationsQuery } from '@/generated/graphql'

const PAGE_SIZE = 50

export type NotificationEntry = NotificationsQuery['notifications']['items'][number]

export function useNotifications(skip: boolean) {
  const client = useApolloClient()
  const [items, setItems] = useState<NotificationEntry[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const { data, loading } = useQuery(NOTIFICATIONS, {
    variables: { input: { limit: PAGE_SIZE, offset: 0, projectId: undefined } },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip,
  })

  useEffect(() => {
    const page = data?.notifications
    if (!page) return
    setItems([...page.items])
    setTotalCount(page.totalCount)
    setHasMore(page.hasMore)
  }, [data])

  async function loadMore(): Promise<void> {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const result = await client.query({
        query: NOTIFICATIONS,
        variables: { input: { limit: PAGE_SIZE, offset: items.length, projectId: undefined } },
        fetchPolicy: 'network-only',
      })
      const page = result.data?.notifications
      if (!page) return
      setItems((prev) => [...prev, ...page.items])
      setHasMore(page.hasMore)
      setTotalCount(page.totalCount)
    } finally {
      setLoadingMore(false)
    }
  }

  const [markReadMutation] = useMutation(MARK_NOTIFICATION_READ)
  const [markAllReadMutation, { loading: markingAllRead }] = useMutation(MARK_ALL_NOTIFICATIONS_READ)
  const [clearAllMutation, { loading: clearingAll }] = useMutation(CLEAR_ALL_NOTIFICATIONS)

  async function markRead(id: string): Promise<void> {
    const target = items.find((item) => item.id === id)
    if (!target || target.readAt) return
    await markReadMutation({ variables: { id } })
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item)),
    )
  }

  async function markAllRead(): Promise<void> {
    await markAllReadMutation()
    const now = new Date().toISOString()
    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt ?? now })))
  }

  async function clearAll(): Promise<void> {
    await clearAllMutation()
    setItems([])
    setTotalCount(0)
    setHasMore(false)
  }

  function prependNotification(entry: NotificationEntry): void {
    setItems((prev) => (prev.some((item) => item.id === entry.id) ? prev : [entry, ...prev]))
    setTotalCount((prev) => prev + 1)
  }

  return {
    items,
    totalCount,
    hasMore,
    loading: loading && items.length === 0,
    loadingMore,
    markingAllRead,
    clearingAll,
    loadMore,
    markRead,
    markAllRead,
    clearAll,
    prependNotification,
  }
}
