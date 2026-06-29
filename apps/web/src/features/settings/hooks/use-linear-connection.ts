import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import {
  LINEAR_CONNECTION,
  LINEAR_AUTHORIZE_URL,
  DISCONNECT_LINEAR,
} from '../graphql/settings.operations'

export function useLinearConnection(projectId: string) {
  const client = useApolloClient()

  const { data, loading } = useQuery(LINEAR_CONNECTION, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [disconnect, { loading: disconnecting }] = useMutation(DISCONNECT_LINEAR, {
    variables: { projectId },
    refetchQueries: [{ query: LINEAR_CONNECTION, variables: { projectId } }],
  })

  async function connect(): Promise<void> {
    const result = await client.query({
      query: LINEAR_AUTHORIZE_URL,
      variables: { projectId },
      fetchPolicy: 'network-only',
    })
    const url = result.data?.linearAuthorizeUrl
    if (url) {
      window.location.href = url
    }
  }

  return {
    connected: data?.linearConnection.connected ?? false,
    linearUser: data?.linearConnection.linearUser ?? null,
    loading,
    disconnecting,
    connect,
    disconnectLinear: () => disconnect(),
  }
}
