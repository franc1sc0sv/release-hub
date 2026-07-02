import { useMutation, useQuery } from '@apollo/client/react'
import type { DigestFrequency, NotificationChannel, NotificationType } from '@/generated/graphql'
import {
  NOTIFICATION_PREFERENCES,
  UPDATE_NOTIFICATION_PREFERENCE,
  TRIGGER_FLAG_DIGEST,
} from '../graphql/settings.operations'

export function useNotificationPreferences(projectId: string) {
  const { data, loading, error } = useQuery(NOTIFICATION_PREFERENCES, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [updatePreference, { loading: updating }] = useMutation(UPDATE_NOTIFICATION_PREFERENCE, {
    refetchQueries: [{ query: NOTIFICATION_PREFERENCES, variables: { projectId } }],
  })

  const [triggerDigest, { loading: triggeringDigest }] = useMutation(TRIGGER_FLAG_DIGEST, {
    variables: { projectId },
  })

  function setPreference(
    notificationType: NotificationType,
    channel: NotificationChannel,
    enabled: boolean,
    digestFrequency: DigestFrequency | null = null,
  ): void {
    updatePreference({
      variables: {
        input: { projectId, notificationType, channel, enabled, digestFrequency },
      },
    })
  }

  return {
    preferences: data?.notificationPreferences ?? [],
    loading,
    error,
    updating,
    triggeringDigest,
    setPreference,
    triggerDigest: () => triggerDigest(),
  }
}
