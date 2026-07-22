import { graphql } from '@/generated/gql'

export const SUMMARY_PROFILES = graphql(`
  query SummaryProfiles($projectId: ID!) {
    summaryProfiles(projectId: $projectId) {
      id
      projectId
      name
      description
      outputTemplate
      createdAt
      updatedAt
      rules {
        id
        content
      }
      examples {
        id
        kind
        content
        explanation
      }
    }
  }
`)

export const SUMMARY_PROFILE = graphql(`
  query SummaryProfile($profileId: ID!) {
    summaryProfile(profileId: $profileId) {
      id
      projectId
      name
      description
      outputTemplate
      createdAt
      updatedAt
      rules {
        id
        content
      }
      examples {
        id
        kind
        content
        explanation
      }
    }
  }
`)

export const CREATE_SUMMARY_PROFILE = graphql(`
  mutation CreateSummaryProfile($input: CreateSummaryProfileInput!) {
    createSummaryProfile(input: $input) {
      id
      projectId
      name
      description
      outputTemplate
      createdAt
      updatedAt
      rules {
        id
        content
      }
      examples {
        id
        kind
        content
        explanation
      }
    }
  }
`)

export const UPDATE_SUMMARY_PROFILE = graphql(`
  mutation UpdateSummaryProfile($input: UpdateSummaryProfileInput!) {
    updateSummaryProfile(input: $input) {
      id
      projectId
      name
      description
      outputTemplate
      createdAt
      updatedAt
      rules {
        id
        content
      }
      examples {
        id
        kind
        content
        explanation
      }
    }
  }
`)

export const DELETE_SUMMARY_PROFILE = graphql(`
  mutation DeleteSummaryProfile($input: DeleteSummaryProfileInput!) {
    deleteSummaryProfile(input: $input)
  }
`)
