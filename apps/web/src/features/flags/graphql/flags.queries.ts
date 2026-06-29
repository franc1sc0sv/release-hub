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
