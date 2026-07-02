import { useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import type { OperationVariables, TypedDocumentNode } from '@apollo/client'

const DEFAULT_LIMIT = 20

interface OffsetPage<TItem> {
  items: readonly TItem[]
  totalCount: number
  hasMore: boolean
}

interface OffsetVariables extends OperationVariables {
  limit: number
  offset: number
}

interface UseInfiniteListOptions<TData, TVariables extends OffsetVariables, TItem> {
  query: TypedDocumentNode<TData, TVariables>
  variables: Omit<TVariables, 'limit' | 'offset'>
  selectPage: (data: TData) => OffsetPage<TItem>
  limit?: number
  skip?: boolean
}

interface UseInfiniteListResult<TItem> {
  items: TItem[]
  totalCount: number
  hasMore: boolean
  loadingInitial: boolean
  loadingMore: boolean
  error: Error | undefined
  sentinelRef: (node: Element | null) => void
}

export function useInfiniteList<TData, TVariables extends OffsetVariables, TItem>({
  query,
  variables,
  selectPage,
  limit = DEFAULT_LIMIT,
  skip = false,
}: UseInfiniteListOptions<TData, TVariables, TItem>): UseInfiniteListResult<TItem> {
  const queryVariables = useMemo(
    () => ({ ...variables, limit, offset: 0 }) as TVariables,
    [variables, limit],
  )

  const { data, previousData, loading, error, fetchMore } = useQuery(query, {
    variables: queryVariables,
    skip,
    notifyOnNetworkStatusChange: true,
  })

  const activeData = data ?? previousData
  const page = activeData ? selectPage(activeData) : undefined
  const items = useMemo(() => (page ? [...page.items] : []), [page])
  const totalCount = page?.totalCount ?? 0
  const hasMore = page?.hasMore ?? false
  const loadingInitial = loading && !activeData
  const loadingMore = loading && Boolean(activeData)

  const fetchMoreRef = useRef(fetchMore)
  fetchMoreRef.current = fetchMore

  const hasMoreRef = useRef(hasMore)
  hasMoreRef.current = hasMore

  const loadingRef = useRef(loading)
  loadingRef.current = loading

  const itemsLengthRef = useRef(items.length)
  itemsLengthRef.current = items.length

  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback((node: Element | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!node) return

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry?.isIntersecting) return
      if (!hasMoreRef.current || loadingRef.current) return

      fetchMoreRef.current({
        variables: { offset: itemsLengthRef.current } as Partial<TVariables>,
      })
    })

    observerRef.current.observe(node)
  }, [])

  return {
    items,
    totalCount,
    hasMore,
    loadingInitial,
    loadingMore,
    error,
    sentinelRef,
  }
}
