import { graphql } from '@/generated/gql'

export const CREATE_RELEASE = graphql(`
  mutation CreateRelease($input: CreateReleaseInput!) {
    createRelease(input: $input) {
      id
      name
      baseRef
      compareRef
      status
      projectId
      createdAt
    }
  }
`)

export const CREATE_GITHUB_BRANCH = graphql(`
  mutation CreateGithubBranch($input: CreateGithubBranchInput!) {
    createGithubBranch(input: $input) {
      name
      commitSha
      protected
    }
  }
`)

export const SHIP_RELEASE = graphql(`
  mutation ShipRelease($input: ShipReleaseInput!) {
    shipRelease(input: $input) {
      id
      name
      status
      tags
      prUrl
      projectId
    }
  }
`)

export const UPDATE_RELEASE = graphql(`
  mutation UpdateRelease($input: UpdateReleaseInput!) {
    updateRelease(input: $input) {
      id
      name
      status
      tags
      prUrl
      aiDraftStatus
      projectId
    }
  }
`)

export const CONFIRM_RELEASE = graphql(`
  mutation ConfirmRelease($input: ConfirmReleaseInput!) {
    confirmRelease(input: $input) {
      id
      name
      status
      prUrl
      projectId
    }
  }
`)

export const ACCEPT_SUGGESTED_FEATURE = graphql(`
  mutation AcceptSuggestedFeature($input: AcceptSuggestedFeatureInput!) {
    acceptSuggestedFeature(input: $input) {
      id
      name
      description
      kind
      suggested
      tags
      projectId
    }
  }
`)

export const REJECT_SUGGESTED_FEATURE = graphql(`
  mutation RejectSuggestedFeature($input: RejectSuggestedFeatureInput!) {
    rejectSuggestedFeature(input: $input)
  }
`)

export const SAVE_RELEASE_SUMMARY = graphql(`
  mutation SaveReleaseSummary($input: SaveReleaseSummaryInput!) {
    saveReleaseSummary(input: $input) {
      id
      summary
      summaryEditedAt
    }
  }
`)

export const GENERATE_PR_SUMMARY = graphql(`
  mutation GeneratePrSummary($prId: ID!) {
    generatePrSummary(prId: $prId) {
      id
      summary
      summaryEditedAt
    }
  }
`)

export const SAVE_PR_SUMMARY = graphql(`
  mutation SavePrSummary($input: SavePrSummaryInput!) {
    savePrSummary(input: $input) {
      id
      summary
      summaryEditedAt
    }
  }
`)

export const DELETE_RELEASE = graphql(`
  mutation DeleteRelease($releaseId: ID!) {
    deleteRelease(releaseId: $releaseId) {
      id
    }
  }
`)
