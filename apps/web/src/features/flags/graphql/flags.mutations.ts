import { graphql } from '@/generated/gql'

export const SYNC_FLAGSMITH_FLAGS = graphql(`
  mutation SyncFlagsmithFlags($projectId: ID!) {
    syncFlagsmithFlags(projectId: $projectId) {
      flagCount
      addedKeys
      removedKeys
      environmentsAdded
      enabledChanges {
        flagKey
        environmentName
        previousValue
        newValue
      }
      valueChanges {
        flagKey
        environmentName
        previousValue
        newValue
      }
      inSync
      syncedAt
    }
  }
`)

export const RUN_FLAG_COVERAGE = graphql(`
  mutation RunFlagCoverage($projectId: ID!) {
    runFlagCoverage(projectId: $projectId) {
      flagsTracked
      branchesScanned
      prChangesDetected
    }
  }
`)

export const RUN_FLAG_COVERAGE_FOR_FLAG = graphql(`
  mutation RunFlagCoverageForFlag($projectId: ID!, $key: String!) {
    runFlagCoverageForFlag(projectId: $projectId, key: $key) {
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
    }
  }
`)
