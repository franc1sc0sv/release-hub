import { graphql } from '@/generated/gql'

export const GET_RELEASES_PAGE = graphql(`
  query GetReleasesPage($projectId: ID!, $limit: Float!, $offset: Float!, $search: String) {
    getReleasesPage(projectId: $projectId, limit: $limit, offset: $offset, search: $search) {
      totalCount
      hasMore
      items {
        id
        name
        baseRef
        compareRef
        status
        tags
        prUrl
        projectId
        createdAt
        updatedAt
      }
    }
  }
`)

export const GET_RELEASE_TREE = graphql(`
  query GetReleaseTree($id: ID!) {
    getReleaseTree(id: $id) {
      release {
        id
        name
        baseRef
        compareRef
        status
        tags
        prUrl
        summary
        summaryEditedAt
        summaryModel
        summaryProfileId
        aiDraftStatus
        summaryStatus
        projectId
        createdAt
        updatedAt
      }
      features {
        feature {
          id
          name
          description
          kind
          suggested
          currentState
          tags
        }
        state
        clientAvailabilityKey
        excludedFromSummary
        flagState {
          staging
          production
        }
        prs {
          id
          number
          title
          url
          body
          author
          mergedAt
          releaseId
          featureId
          pendingAddition
          aiConfidence
          aiRationale
          summary
          summaryEditedAt
          tickets {
            issueId
            source
            url
            title
            description
            confidence
          }
          commits {
            sha
            message
            author
            date
          }
          flagChanges {
            flagKey
            action
            kind
          }
        }
      }
    }
  }
`)

export const GET_COVERAGE = graphql(`
  query GetCoverage($releaseId: ID!) {
    getCoverage(releaseId: $releaseId) {
      total
      assigned
      ready
    }
  }
`)

export const SEARCH_GITHUB_BRANCHES = graphql(`
  query SearchGithubBranches($projectId: ID!, $search: String, $limit: Float!) {
    searchGithubBranches(projectId: $projectId, search: $search, limit: $limit) {
      hasMore
      items {
        name
        protected
      }
    }
  }
`)

export const COMPARE_REFS = graphql(`
  query CompareRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {
    compareRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {
      aheadBy
      behindBy
      totalCommits
      commits {
        sha
        message
        author
        committedAt
      }
    }
  }
`)

export const CARRIED_OVER_FLAGS = graphql(`
  query CarriedOverFlags($releaseId: ID!) {
    carriedOverFlags(releaseId: $releaseId) {
      trackedFlagId
      key
      featureId
      featureName
      originReleaseId
      originReleaseName
      decision
      deploymentStatus
      decidedAt
      featureReleaseState
    }
  }
`)

export const RELEASE_FLAGS = graphql(`
  query ReleaseFlags($releaseId: ID!) {
    releaseFlags(releaseId: $releaseId) {
      id
      key
      decision
      decidedAt
      suggestedFeatureState
      featureReleaseState
      feature {
        id
        name
      }
      changes {
        kind
        action
        detectedFile
        prNumber
        prTitle
        prUrl
      }
    }
  }
`)

export const IN_PROGRESS_FLAG_REMINDERS = graphql(`
  query InProgressFlagReminders($projectId: ID!, $excludeReleaseId: ID) {
    inProgressFlagReminders(projectId: $projectId, excludeReleaseId: $excludeReleaseId) {
      trackedFlagId
      key
      releaseId
      releaseVersion
      decidedAt
      featureId
    }
  }
`)

