import { useQuery } from '@apollo/client/react'
import type {
  BranchActivityRange,
  BranchCleanupSortField,
  BranchProtectionFilter,
  BranchSignalFilter,
  SortDirection,
} from '@/generated/graphql'
import { GET_BRANCH_CLEANUP_PAGE } from '../graphql/repo-ops.queries'

interface UseBranchCleanupPageParams {
  projectId: string | null
  limit: number
  offset: number
  search?: string
  sortField?: BranchCleanupSortField | null
  sortDirection?: SortDirection
  authorFilter?: string
  activity?: BranchActivityRange | null
  protection?: BranchProtectionFilter | null
  signals?: BranchSignalFilter[]
}

export function useBranchCleanupPage({
  projectId,
  limit,
  offset,
  search,
  sortField,
  sortDirection,
  authorFilter,
  activity,
  protection,
  signals,
}: UseBranchCleanupPageParams) {
  const { data, loading, error, refetch } = useQuery(GET_BRANCH_CLEANUP_PAGE, {
    variables: {
      input: {
        projectId: projectId ?? '',
        limit,
        offset,
        search: search || undefined,
        sortField: sortField ?? undefined,
        sortDirection: sortDirection ?? undefined,
        authorFilter: authorFilter || undefined,
        activity: activity ?? undefined,
        protection: protection ?? undefined,
        signals: signals && signals.length > 0 ? signals : undefined,
      },
    },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  })

  return {
    items: data?.branchCleanupPage.items ?? [],
    totalCount: data?.branchCleanupPage.totalCount ?? 0,
    loading,
    error: error ?? null,
    refetch,
  }
}
