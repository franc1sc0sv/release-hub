import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import {
  GITHUB_CONNECTION,
  GITHUB_AUTHORIZE_URL,
  DISCONNECT_GITHUB,
  REAUTHORIZE_GITHUB,
} from '../graphql/settings.operations'

export function useGithubConnection() {
  const client = useApolloClient()

  const { data, loading } = useQuery(GITHUB_CONNECTION, {
    fetchPolicy: 'cache-and-network',
  })

  const [disconnect, { loading: disconnecting }] = useMutation(DISCONNECT_GITHUB, {
    refetchQueries: [{ query: GITHUB_CONNECTION }],
  })

  const [reauthorize, { loading: reconnecting }] = useMutation(REAUTHORIZE_GITHUB)

  async function redirectToAuthorize(): Promise<void> {
    const result = await client.query({
      query: GITHUB_AUTHORIZE_URL,
      fetchPolicy: 'network-only',
    })
    const url = result.data?.githubAuthorizeUrl
    if (url) {
      window.location.href = url
    }
  }

  async function connect(): Promise<void> {
    await redirectToAuthorize()
  }

  async function reconnect(): Promise<void> {
    await reauthorize()
    await redirectToAuthorize()
  }

  return {
    connected: data?.githubConnection.connected ?? false,
    githubLogin: data?.githubConnection.githubLogin ?? null,
    loading,
    disconnecting,
    reconnecting,
    connect,
    reconnect,
    disconnectGithub: () => disconnect(),
  }
}
