import { useState } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import {
  SLACK_CONNECTION,
  SLACK_AUTHORIZE_URL,
  SLACK_CHANNELS,
  DISCONNECT_SLACK,
  SET_SLACK_CHANNEL,
  UPDATE_SLACK_NOTIFICATION_SETTINGS,
  SEND_SLACK_TEST_MESSAGE,
} from '../graphql/settings.operations'

interface SlackChannelOption {
  id: string
  name: string
}

export function useSlackConnection(projectId: string) {
  const client = useApolloClient()
  const [loadingChannels, setLoadingChannels] = useState(false)
  const [channels, setChannels] = useState<SlackChannelOption[]>([])
  const [sendingTest, setSendingTest] = useState(false)

  const { data, loading } = useQuery(SLACK_CONNECTION, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [disconnect, { loading: disconnecting }] = useMutation(DISCONNECT_SLACK, {
    variables: { projectId },
    refetchQueries: [{ query: SLACK_CONNECTION, variables: { projectId } }],
  })

  const [setChannel, { loading: settingChannel }] = useMutation(SET_SLACK_CHANNEL, {
    refetchQueries: [{ query: SLACK_CONNECTION, variables: { projectId } }],
  })

  const [updateNotificationSettings, { loading: updatingNotificationSettings }] = useMutation(
    UPDATE_SLACK_NOTIFICATION_SETTINGS,
    {
      refetchQueries: [{ query: SLACK_CONNECTION, variables: { projectId } }],
    },
  )

  async function connect(): Promise<void> {
    const result = await client.query({
      query: SLACK_AUTHORIZE_URL,
      variables: { projectId },
      fetchPolicy: 'network-only',
    })
    const url = result.data?.slackAuthorizeUrl
    if (url) {
      window.location.href = url
    }
  }

  async function loadChannels(): Promise<SlackChannelOption[]> {
    setLoadingChannels(true)
    try {
      const result = await client.query({
        query: SLACK_CHANNELS,
        variables: { projectId },
        fetchPolicy: 'network-only',
      })
      const options = result.data?.slackChannels ?? []
      setChannels(options)
      return options
    } finally {
      setLoadingChannels(false)
    }
  }

  function selectChannel(channelId: string, channelName: string): void {
    setChannel({ variables: { projectId, channelId, channelName } })
  }

  function updateNotifications(
    notifyOnCreated: boolean,
    notifyOnShipped: boolean,
    notifyOnDeployed: boolean,
  ): void {
    updateNotificationSettings({
      variables: { projectId, notifyOnCreated, notifyOnShipped, notifyOnDeployed },
    })
  }

  async function sendTestMessage(): Promise<{ ok: boolean; error: string | null | undefined }> {
    setSendingTest(true)
    try {
      const result = await client.mutate({
        mutation: SEND_SLACK_TEST_MESSAGE,
        variables: { projectId },
      })
      return result.data?.sendSlackTestMessage ?? { ok: false, error: null }
    } finally {
      setSendingTest(false)
    }
  }

  return {
    connected: data?.slackConnection.connected ?? false,
    teamName: data?.slackConnection.teamName ?? null,
    channelId: data?.slackConnection.channelId ?? null,
    channelName: data?.slackConnection.channelName ?? null,
    notifyOnCreated: data?.slackConnection.notifyOnCreated ?? true,
    notifyOnShipped: data?.slackConnection.notifyOnShipped ?? true,
    notifyOnDeployed: data?.slackConnection.notifyOnDeployed ?? true,
    loading,
    disconnecting,
    settingChannel,
    updatingNotificationSettings,
    loadingChannels,
    channels,
    sendingTest,
    connect,
    disconnectSlack: () => disconnect(),
    loadChannels,
    selectChannel,
    updateNotifications,
    sendTestMessage,
  }
}
