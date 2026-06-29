import { useQuery } from '@apollo/client/react'
import { GET_FEATURE } from '../graphql/features.queries'
import type { GetFeatureQuery } from '@/generated/graphql'

export type FeatureDetail = GetFeatureQuery['getFeature']

export function useFeature(id: string | undefined) {
  const { data, loading, error } = useQuery(GET_FEATURE, {
    variables: { id: id ?? '' },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })

  return {
    detail: data?.getFeature ?? null,
    loading,
    error,
  }
}
