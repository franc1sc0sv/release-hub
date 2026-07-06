import { useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import { GITHUB_INSTALL_URL } from '../graphql/settings.operations'

export function useGithubConnection() {
  const client = useApolloClient()
  const [loading, setLoading] = useState(false)

  async function installViaApp(opts?: { projectId?: string; organizationId?: string }): Promise<void> {
    setLoading(true)
    try {
      const result = await client.query({
        query: GITHUB_INSTALL_URL,
        variables: { projectId: opts?.projectId ?? null, organizationId: opts?.organizationId ?? null },
        fetchPolicy: 'network-only',
      })
      const url = result.data?.githubInstallUrl
      if (url) {
        window.location.href = url
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    installViaApp,
  }
}
