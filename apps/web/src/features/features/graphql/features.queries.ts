import { graphql } from '@/generated/gql'

export const LIST_FEATURES_PAGE = graphql(`
  query ListFeaturesPage($input: ListFeaturesPageInput!) {
    listFeaturesPage(input: $input) {
      totalCount
      hasMore
      items {
        id
        projectId
        name
        description
        kind
        suggested
        tags
        currentState
        createdAt
        updatedAt
      }
    }
  }
`)

export const GET_FEATURE = graphql(`
  query GetFeature($id: ID!) {
    getFeature(id: $id) {
      feature {
        id
        projectId
        name
        description
        kind
        suggested
        tags
        currentState
        createdAt
        updatedAt
      }
      releases {
        id
        name
        baseRef
        compareRef
        status
        createdAt
      }
      prs {
        id
        number
        title
        author
        mergedAt
        releaseId
        body
        tickets {
          issueId
          source
          url
          title
          confidence
        }
        commits {
          sha
          message
          author
          date
        }
      }
      snapshots {
        releaseId
        state
        flagState {
          staging
          production
        }
      }
    }
  }
`)
