import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react'
import {
  FLAG_REGISTRY,
  REPO_FILE_SEARCH,
  SET_FLAG_REGISTRY,
} from '../graphql/settings.operations'

const SEARCH_LIMIT = 20

export function useFlagRegistry(projectId: string) {
  const {
    data: flagRegistryData,
    loading: loadingFlagRegistry,
  } = useQuery(FLAG_REGISTRY, {
    variables: { projectId },
    skip: !projectId,
  })

  const [searchFiles, { data, loading: searching }] = useLazyQuery(REPO_FILE_SEARCH, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  const [setFlagRegistry, { loading: saving }] = useMutation(SET_FLAG_REGISTRY, {
    refetchQueries: [{ query: FLAG_REGISTRY, variables: { projectId } }],
  })

  function searchRepoFiles(query: string, branch?: string): void {
    if (!query.trim()) return
    searchFiles({
      variables: {
        input: {
          projectId,
          query: query.trim(),
          branch: branch?.trim() || undefined,
          limit: SEARCH_LIMIT,
        },
      },
    })
  }

  async function saveFlagRegistry(path: string, branch?: string) {
    return setFlagRegistry({
      variables: {
        input: {
          projectId,
          path,
          branch: branch?.trim() || undefined,
        },
      },
    })
  }

  return {
    flagRegistry: flagRegistryData?.flagRegistry,
    loadingFlagRegistry,
    searchResults: data?.repoFileSearch ?? [],
    searching,
    saving,
    searchRepoFiles,
    saveFlagRegistry,
  }
}
