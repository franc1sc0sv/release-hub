import { graphql } from '@/generated/gql'

export const LIST_PROJECTS = graphql(`
  query ListProjects {
    listProjects {
      id
      name
      repo
      connectionHealth {
        github
        linear
        flagsmith
      }
      integrations {
        github
        linear
        flagsmith
      }
    }
  }
`)

export const GET_PROJECT = graphql(`
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      name
      repo
      connectionHealth {
        github
        linear
        flagsmith
      }
      integrations {
        github
        linear
        flagsmith
      }
    }
  }
`)
