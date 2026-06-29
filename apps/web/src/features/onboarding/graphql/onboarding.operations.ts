import { graphql } from '@/generated/gql'

export const GITHUB_REPOSITORIES = graphql(`
  query GithubRepositories {
    githubRepositories {
      fullName
      name
      owner
      private
      defaultBranch
      description
      htmlUrl
    }
  }
`)

export const CREATE_PROJECT = graphql(`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      repo
    }
  }
`)
