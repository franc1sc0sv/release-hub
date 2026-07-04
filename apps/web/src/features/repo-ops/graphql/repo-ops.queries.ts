import { graphql } from '@/generated/gql'

export const GET_BRANCH_CLEANUP_PAGE = graphql(`
  query GetBranchCleanupPage($input: BranchCleanupPageInput!) {
    branchCleanupPage(input: $input) {
      totalCount
      items {
        name
        isDefault
        githubProtected
        lastCommitAt
        lastCommitAuthorLogin
        lastCommitAuthorName
        lastCommitAuthorAvatarUrl
        openPullRequestNumber
        openPullRequestUrl
        blockReasons
        deletable
        overridable
        signals {
          mergedViaPr
          noOpenPr
          unreferencedByReleases
        }
      }
    }
  }
`)

export const GET_BRANCH_AUTHORS = graphql(`
  query GetBranchAuthors($projectId: ID!) {
    branchAuthors(projectId: $projectId)
  }
`)

export const GET_BRANCH_CLEANUP_PLAN = graphql(`
  query GetBranchCleanupPlan($projectId: ID!) {
    branchCleanupPlan(projectId: $projectId) {
      totalCount
      deletable {
        name
        lastCommitAt
        lastCommitAuthorLogin
        lastCommitAuthorName
        lastCommitAuthorAvatarUrl
      }
      kept {
        name
        blockReasons
      }
    }
  }
`)
