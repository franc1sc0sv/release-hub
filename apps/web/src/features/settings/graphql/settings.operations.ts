import { graphql } from '@/generated/gql'

export const GET_CONNECTION_SETTINGS = graphql(`
  query GetConnectionSettings($projectId: ID!) {
    getConnectionSettings(projectId: $projectId) {
      githubConnected
      flagsmithConnected
      flagsmithUrl
      flagsmithProjectId
      linearConnected
    }
  }
`)

export const FLAGSMITH_PROJECTS = graphql(`
  query FlagsmithProjects($projectId: ID!, $url: String!, $apiKey: String!) {
    flagsmithProjects(projectId: $projectId, url: $url, apiKey: $apiKey) {
      id
      name
    }
  }
`)

export const UPDATE_CONNECTION_SETTINGS = graphql(`
  mutation UpdateConnectionSettings($input: UpdateConnectionSettingsInput!) {
    updateConnectionSettings(input: $input) {
      githubConnected
      flagsmithConnected
      flagsmithUrl
      flagsmithProjectId
      linearConnected
    }
  }
`)

export const PROJECT_TAGS = graphql(`
  query ProjectTags($projectId: ID!) {
    projectTags(projectId: $projectId) {
      id
      name
      color
      createdAt
    }
  }
`)

export const CREATE_PROJECT_TAG = graphql(`
  mutation CreateProjectTag($input: CreateProjectTagInput!) {
    createProjectTag(input: $input) {
      id
      name
      color
      createdAt
    }
  }
`)

export const DELETE_PROJECT_TAG = graphql(`
  mutation DeleteProjectTag($input: DeleteProjectTagInput!) {
    deleteProjectTag(input: $input)
  }
`)

export const GITHUB_CONNECTION = graphql(`
  query GithubConnection {
    githubConnection {
      connected
      githubLogin
    }
  }
`)

export const GITHUB_AUTHORIZE_URL = graphql(`
  query GithubAuthorizeUrl {
    githubAuthorizeUrl
  }
`)

export const DISCONNECT_GITHUB = graphql(`
  mutation DisconnectGithub {
    disconnectGithub
  }
`)

export const REAUTHORIZE_GITHUB = graphql(`
  mutation ReauthorizeGithub {
    reauthorizeGithub
  }
`)

export const LINEAR_CONNECTION = graphql(`
  query LinearConnection($projectId: ID!) {
    linearConnection(projectId: $projectId) {
      connected
      linearUser
    }
  }
`)

export const LINEAR_AUTHORIZE_URL = graphql(`
  query LinearAuthorizeUrl($projectId: ID!) {
    linearAuthorizeUrl(projectId: $projectId)
  }
`)

export const DISCONNECT_LINEAR = graphql(`
  mutation DisconnectLinear($projectId: ID!) {
    disconnectLinear(projectId: $projectId)
  }
`)

export const VERIFY_FLAGSMITH_CONNECTION = graphql(`
  query VerifyFlagsmithConnection($projectId: ID!, $url: String!, $apiKey: String!, $flagsmithProjectId: String!) {
    verifyFlagsmithConnection(projectId: $projectId, url: $url, apiKey: $apiKey, flagsmithProjectId: $flagsmithProjectId) {
      ok
      projectName
      environments
      hasStaging
      hasProduction
      warnings
      message
    }
  }
`)
