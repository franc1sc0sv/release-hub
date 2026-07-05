import { graphql } from '@/generated/gql'

export const CREATE_PROJECT = graphql(`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      repo
    }
  }
`)
