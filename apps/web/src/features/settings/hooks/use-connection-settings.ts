import { useState } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import {
  GET_CONNECTION_SETTINGS,
  UPDATE_CONNECTION_SETTINGS,
  FLAGSMITH_PROJECTS,
  VERIFY_FLAGSMITH_CONNECTION,
} from '../graphql/settings.operations'

interface FlagsmithProjectOption {
  id: string
  name: string
}

interface FlagsmithVerifyResult {
  ok: boolean
  projectName: string | null | undefined
  environments: string[]
  hasStaging: boolean
  hasProduction: boolean
  warnings: string[]
  message: string | null | undefined
}

export function useConnectionSettings(projectId: string) {
  const client = useApolloClient()
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const { data, loading, error } = useQuery(GET_CONNECTION_SETTINGS, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [updateConnectionSettings, { loading: updating }] = useMutation(
    UPDATE_CONNECTION_SETTINGS,
    {
      refetchQueries: [
        { query: GET_CONNECTION_SETTINGS, variables: { projectId } },
      ],
    },
  )

  async function loadFlagsmithProjects(
    url: string,
    apiKey: string,
  ): Promise<FlagsmithProjectOption[]> {
    setLoadingProjects(true)
    try {
      const result = await client.query({
        query: FLAGSMITH_PROJECTS,
        variables: { projectId, url, apiKey },
        fetchPolicy: 'network-only',
      })
      return result.data?.flagsmithProjects ?? []
    } finally {
      setLoadingProjects(false)
    }
  }

  async function verifyFlagsmithConnection(
    url: string,
    apiKey: string,
    flagsmithProjectId: string,
  ): Promise<FlagsmithVerifyResult> {
    setVerifying(true)
    try {
      const result = await client.query({
        query: VERIFY_FLAGSMITH_CONNECTION,
        variables: { projectId, url, apiKey, flagsmithProjectId },
        fetchPolicy: 'network-only',
      })
      const r = result.data?.verifyFlagsmithConnection
      if (!r) throw new Error('No result')
      return {
        ok: r.ok,
        projectName: r.projectName,
        environments: r.environments,
        hasStaging: r.hasStaging,
        hasProduction: r.hasProduction,
        warnings: r.warnings,
        message: r.message,
      }
    } finally {
      setVerifying(false)
    }
  }

  function connectFlagsmith(
    apiKey: string,
    flagsmithUrl: string,
    flagsmithProjectId: string,
  ): void {
    updateConnectionSettings({
      variables: {
        input: {
          projectId,
          flagsmithApiKey: apiKey,
          flagsmithUrl,
          flagsmithProjectId,
        },
      },
    })
  }

  function disconnectFlagsmith(): void {
    updateConnectionSettings({
      variables: {
        input: {
          projectId,
          flagsmithApiKey: null,
          flagsmithUrl: null,
          flagsmithProjectId: null,
        },
      },
    })
  }

  return {
    settings: data?.getConnectionSettings ?? null,
    loading,
    error,
    updating,
    loadingProjects,
    verifying,
    loadFlagsmithProjects,
    verifyFlagsmithConnection,
    connectFlagsmith,
    disconnectFlagsmith,
  }
}
