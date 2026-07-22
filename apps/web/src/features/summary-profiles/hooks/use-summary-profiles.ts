import { useMutation, useQuery } from '@apollo/client/react'
import type { CreateSummaryProfileInput, UpdateSummaryProfileInput } from '@/generated/graphql'
import {
  SUMMARY_PROFILES,
  CREATE_SUMMARY_PROFILE,
  UPDATE_SUMMARY_PROFILE,
  DELETE_SUMMARY_PROFILE,
} from '../graphql/summary-profiles.operations'

export function useSummaryProfiles(projectId: string) {
  const { data, loading, error } = useQuery(SUMMARY_PROFILES, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [createSummaryProfile, { loading: creating, error: createError }] = useMutation(
    CREATE_SUMMARY_PROFILE,
    {
      refetchQueries: [{ query: SUMMARY_PROFILES, variables: { projectId } }],
    },
  )

  const [updateSummaryProfile, { loading: updating, error: updateError }] = useMutation(
    UPDATE_SUMMARY_PROFILE,
    {
      refetchQueries: [{ query: SUMMARY_PROFILES, variables: { projectId } }],
    },
  )

  const [deleteSummaryProfile, { loading: deleting }] = useMutation(DELETE_SUMMARY_PROFILE, {
    refetchQueries: [{ query: SUMMARY_PROFILES, variables: { projectId } }],
  })

  function createProfile(input: CreateSummaryProfileInput): Promise<unknown> {
    return createSummaryProfile({ variables: { input } })
  }

  function updateProfile(input: UpdateSummaryProfileInput): Promise<unknown> {
    return updateSummaryProfile({ variables: { input } })
  }

  function removeProfile(profileId: string): Promise<unknown> {
    return deleteSummaryProfile({ variables: { input: { profileId } } })
  }

  return {
    profiles: data?.summaryProfiles ?? [],
    loading,
    error,
    creating,
    createError,
    updating,
    updateError,
    deleting,
    createProfile,
    updateProfile,
    removeProfile,
  }
}
