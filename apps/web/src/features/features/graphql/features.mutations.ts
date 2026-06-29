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

export const ASSIGN_PR_TO_FEATURE = graphql(`
  mutation AssignPrToFeature($input: AssignPrToFeatureInput!) {
    assignPrToFeature(input: $input)
  }
`)

export const SET_FEATURE_STATE = graphql(`
  mutation SetFeatureState($input: SetFeatureStateInput!) {
    setFeatureState(input: $input) {
      featureId
      releaseId
      state
      clientAvailabilityKey
      flagState {
        staging
        production
      }
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
