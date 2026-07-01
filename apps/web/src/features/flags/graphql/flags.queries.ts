import { graphql } from '@/generated/gql'

export const GET_FLAGS = graphql(`
  query GetFlags($input: GetFlagsInput!) {
    getFlags(input: $input) {
      environments
      totalCount
      items {
        key
        createdAt
        environments {
          name
          enabled
        }
      }
    }
  }
`)

export const COMPARE_FLAGS = graphql(`
  query CompareFlags($projectId: ID!, $baselineEnvironments: [String!]!, $comparedEnvironments: [String!]!) {
    compareFlags(projectId: $projectId, baselineEnvironments: $baselineEnvironments, comparedEnvironments: $comparedEnvironments) {
      baselineEnvironments
      comparedEnvironments
      items {
        key
        createdAt
        baselineEnabled
        baselineConflict
        baseline { name enabled }
        divergences { name enabled }
      }
    }
  }
`)

export const TRACKED_FLAGS = graphql(`
  query TrackedFlags($projectId: ID!) {
    trackedFlags(projectId: $projectId) {
      id
      key
      presentInCode
      addedInPullRequestNumber
      branchesPresentCount
      branchPresences {
        branch
        present
      }
      feature {
        id
        name
      }
    }
  }
`)

export const TRACKED_FLAG = graphql(`
  query TrackedFlag($projectId: ID!, $key: String!) {
    trackedFlag(projectId: $projectId, key: $key) {
      id
      key
      presentInCode
      delivery {
        inDefaultBranch
        shippedReleaseVersions
      }
      feature {
        id
        name
      }
      branchPresences {
        branch
        present
        firstSeenAt
        lastConfirmedAt
      }
      releases {
        releaseId
        version
        status
        date
        decision
      }
      pullRequestChanges {
        prNumber
        prTitle
        prAuthor
        prMergedAt
        kind
        action
        detectedFile
      }
      events {
        type
        description
        occurredAt
      }
    }
  }
`)
