import { useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { useProject } from '@/context/project.context'
import { LIST_FEATURES_PAGE } from '../graphql/features.queries'
import type { ListFeaturesPageQuery } from '@/generated/graphql'

const PAGE_LIMIT = 20

export type FeaturePageItem = ListFeaturesPageQuery['listFeaturesPage']['items'][number]

interface UseFeaturesPageOptions {
  search: string
}

export function useFeaturesPage({ search }: UseFeaturesPageOptions) {
  const { activeProject } = useProject()
  const projectId = activeProject?.id ?? ''

  const input = useMemo(
    () => ({
      projectId,
      search: search || undefined,
      limit: PAGE_LIMIT,
      offset: 0,
      assignableOnly: false,
    }),
    [projectId, search],
  )

  const { data, previousData, loading, error, fetchMore } = useQuery(LIST_FEATURES_PAGE, {
    variables: { input },
    skip: !activeProject?.id,
    notifyOnNetworkStatusChange: true,
  })

  const activeData = data ?? previousData
  const page = activeData?.listFeaturesPage
  const features = useMemo(() => (page ? [...page.items] : []), [page])
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

  const featuresLengthRef = useRef(features.length)
  featuresLengthRef.current = features.length

  const inputRef = useRef(input)
  inputRef.current = input

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
        variables: { input: { ...inputRef.current, offset: featuresLengthRef.current } },
      })
    })

    observerRef.current.observe(node)
  }, [])

  return {
    features,
    totalCount,
    loadingInitial,
    loadingMore,
    error,
    sentinelRef,
  }
}
