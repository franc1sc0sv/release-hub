import { useQuery, useMutation } from '@apollo/client/react'
import {
  PROJECT_TAGS,
  CREATE_PROJECT_TAG,
  DELETE_PROJECT_TAG,
} from '../graphql/settings.operations'

export function useProjectTags(projectId: string) {
  const { data, loading, error } = useQuery(PROJECT_TAGS, {
    variables: { projectId },
    fetchPolicy: 'cache-and-network',
  })

  const [createProjectTag, { loading: creating, error: createError }] =
    useMutation(CREATE_PROJECT_TAG, {
      refetchQueries: [{ query: PROJECT_TAGS, variables: { projectId } }],
    })

  const [deleteProjectTag, { loading: deleting }] = useMutation(
    DELETE_PROJECT_TAG,
    {
      refetchQueries: [{ query: PROJECT_TAGS, variables: { projectId } }],
    },
  )

  function addTag(name: string, color?: string): Promise<unknown> {
    return createProjectTag({
      variables: { input: { projectId, name, color } },
    })
  }

  function removeTag(tagId: string): Promise<unknown> {
    return deleteProjectTag({ variables: { input: { tagId } } })
  }

  return {
    tags: data?.projectTags ?? [],
    loading,
    error,
    creating,
    deleting,
    createError,
    addTag,
    removeTag,
  }
}
