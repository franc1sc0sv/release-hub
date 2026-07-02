import { graphql } from '@/generated/gql'

export const SYNC_FLAGSMITH_FLAGS = graphql(`
  mutation SyncFlagsmithFlags($projectId: ID!) {
    syncFlagsmithFlags(projectId: $projectId)
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
      events {
        type
        description
        occurredAt
      }
    }
  }
`)
