import { useMutation, useQuery } from '@apollo/client/react'
import type { DigestFrequency, NotificationChannel, NotificationType } from '@/generated/graphql'
import {
  NOTIFICATION_PREFERENCES,
  UPDATE_NOTIFICATION_PREFERENCE,
  TRIGGER_FLAG_DIGEST,
} from '../graphql/settings.operations'

export function useNotificationPreferences(projectId: string) {
  const { data, loading, error, refetch } = useQuery(NOTIFICATION_PREFERENCES, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [updatePreferenceMutation, { loading: updating }] = useMutation(UPDATE_NOTIFICATION_PREFERENCE)

  const [triggerDigest, { loading: triggeringDigest }] = useMutation(TRIGGER_FLAG_DIGEST, {
    variables: { projectId },
  })

  function updatePreference(
    notificationType: NotificationType,
    channel: NotificationChannel,
    enabled: boolean,
    digestFrequency: DigestFrequency | null = null,
  ) {
    return updatePreferenceMutation({
      variables: { input: { projectId, notificationType, channel, enabled, digestFrequency } },
    })
  }

  async function setPreference(
    notificationType: NotificationType,
    channel: NotificationChannel,
    enabled: boolean,
    digestFrequency: DigestFrequency | null = null,
  ): Promise<void> {
    await updatePreference(notificationType, channel, enabled, digestFrequency)
    await refetch()
  }

  async function setPreferencesForColumn(
    notificationTypes: NotificationType[],
    channel: NotificationChannel,
    enabled: boolean,
  ): Promise<void> {
    await Promise.all(notificationTypes.map((notificationType) => updatePreference(notificationType, channel, enabled)))
    await refetch()
  }

  return {
    preferences: data?.notificationPreferences ?? [],
    loading,
    error,
    updating,
    triggeringDigest,
    setPreference,
    setPreferencesForColumn,
    triggerDigest: () => triggerDigest(),
  }
}
