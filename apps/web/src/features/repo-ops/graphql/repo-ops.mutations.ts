import { graphql } from '@/generated/gql'

export const BLOCK_BRANCH = graphql(`
  mutation BlockBranch($input: BlockBranchInput!) {
    blockBranch(input: $input) {
      id
      branchName
      reason
      createdAt
      createdById
      projectId
    }
  }
`)

export const UNBLOCK_BRANCH = graphql(`
  mutation UnblockBranch($input: UnblockBranchInput!) {
    unblockBranch(input: $input)
  }
`)

export const DELETE_GITHUB_BRANCHES = graphql(`
  mutation DeleteGithubBranches($input: DeleteGithubBranchesInput!) {
    deleteGithubBranches(input: $input) {
      branchName
      deleted
      reason
    }
  }
`)
