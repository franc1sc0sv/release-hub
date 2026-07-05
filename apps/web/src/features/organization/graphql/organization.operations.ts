import { graphql } from '@/generated/gql'

export const MY_ORGANIZATIONS = graphql(`
  query MyOrganizations {
    myOrganizations {
      id
      name
      role
      slug
      githubConnected
    }
  }
`)

export const GET_ORGANIZATION = graphql(`
  query GetOrganization($organizationId: ID!) {
    getOrganization(organizationId: $organizationId) {
      id
      name
      role
      slug
      githubConnected
    }
  }
`)

export const LIST_ORG_MEMBERS = graphql(`
  query ListOrgMembers($organizationId: ID!) {
    listOrgMembers(organizationId: $organizationId) {
      id
      userId
      organizationId
      role
      name
      email
      avatarUrl
      createdAt
      updatedAt
    }
  }
`)

export const GITHUB_INSTALLATION_REPOSITORIES = graphql(`
  query GithubInstallationRepositories($organizationId: ID!) {
    githubInstallationRepositories(organizationId: $organizationId) {
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

export const CREATE_ORGANIZATION = graphql(`
  mutation CreateOrganization($input: CreateOrganizationInput!) {
    createOrganization(input: $input) {
      id
      name
      role
      slug
      githubConnected
    }
  }
`)

export const UPDATE_ORGANIZATION = graphql(`
  mutation UpdateOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      id
      name
      role
      slug
      githubConnected
    }
  }
`)

export const DELETE_ORGANIZATION = graphql(`
  mutation DeleteOrganization($organizationId: ID!) {
    deleteOrganization(organizationId: $organizationId)
  }
`)
