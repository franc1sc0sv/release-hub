import { graphql } from '@/generated/gql'

export const GET_FLAGS = graphql(`
  query GetFlags($input: GetFlagsInput!) {
    getFlags(input: $input) {
      environments
      totalCount
      lastSyncedAt
      items {
        key
        createdAt
        deploymentStatus
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
        baseline { name enabled value }
        divergences { name enabled value }
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

export const GET_FLAG_DETAIL = graphql(`
  query GetFlagDetail($projectId: ID!, $key: String!) {
    flagDetail(projectId: $projectId, key: $key) {
      key
      deploymentStatus
      hasConflict
      flagsmith {
        exists
        lastSyncedAt
        environments {
          name
          enabled
          value
          updatedAt
        }
      }
      tracked {
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
        releases {
          releaseId
          version
          status
          date
          decision
        }
      }
    }
  }
`)

export const GET_FLAG_HISTORY = graphql(`
  query GetFlagHistory($input: GetFlagHistoryInput!) {
    flagHistory(input: $input) {
      totalCount
      items {
        id
        type
        environmentName
        previousValue
        newValue
        releaseId
        releaseName
        actorName
        source
        occurredAt
        branchName
        prNumber
        detectedFile
      }
    }
  }
`)
