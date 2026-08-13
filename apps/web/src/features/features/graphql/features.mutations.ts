import { graphql } from '@/generated/gql'

export const CREATE_FEATURE = graphql(`
  mutation CreateFeature($input: CreateFeatureInput!) {
    createFeature(input: $input) {
      id
      projectId
      name
      description
      kind
      tags
      createdAt
      updatedAt
    }
  }
`)

export const SET_FEATURE_STATE = graphql(`
  mutation SetFeatureState($input: SetFeatureStateInput!) {
    setFeatureState(input: $input) {
      id
      currentState
      updatedAt
    }
  }
`)

export const SET_FEATURE_RELEASE_STATE = graphql(`
  mutation SetFeatureReleaseState($input: SetFeatureReleaseStateInput!) {
    setFeatureReleaseState(input: $input) {
      featureId
      releaseId
      state
      updatedAt
    }
  }
`)

export const SET_FEATURE_TAGS = graphql(`
  mutation SetFeatureTags($input: SetFeatureTagsInput!) {
    setFeatureTags(input: $input) {
      id
      projectId
      name
      description
      kind
      tags
      createdAt
      updatedAt
    }
  }
`)

export const DELETE_FEATURE = graphql(`
  mutation DeleteFeature($id: ID!) {
    deleteFeature(id: $id)
  }
`)
