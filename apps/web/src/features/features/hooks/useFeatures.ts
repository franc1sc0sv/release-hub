import { useQuery } from '@apollo/client/react'
import { useProject } from '@/context/project.context'
import { LIST_FEATURES } from '../graphql/features.queries'
import type { ListFeaturesQuery } from '@/generated/graphql'

export type FeatureItem = ListFeaturesQuery['listFeatures'][number]

export function useFeatures() {
  const { activeProject } = useProject()

  const { data, loading, error, refetch } = useQuery(LIST_FEATURES, {
    variables: { projectId: activeProject?.id ?? '' },
    skip: !activeProject?.id,
    fetchPolicy: 'cache-and-network',
  })

  return {
    features: data?.listFeatures ?? [],
    loading,
    error,
    refetch,
  }
}
