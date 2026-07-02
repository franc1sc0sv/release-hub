import { graphql } from '@/generated/gql'

export const GET_BRANCH_CLEANUP_CANDIDATES = graphql(`
  query GetBranchCleanupCandidates($projectId: ID!) {
    branchCleanupCandidates(projectId: $projectId) {
      name
      lastCommitDate
      protected
      suggested
      signals {
        mergedViaPr
        stale
        unreferencedByReleases
        noOpenPr
        blocked
        isDefault
      }
    }
  }
`)

export const GET_BLOCKED_BRANCHES = graphql(`
  query GetBlockedBranches($projectId: ID!) {
    blockedBranches(projectId: $projectId) {
      id
      branchName
      reason
      createdAt
      createdById
      projectId
    }
  }
`)
