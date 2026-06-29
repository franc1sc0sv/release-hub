import { graphql } from '@/generated/gql'

export const GET_RELEASES = graphql(`
  query GetReleases($projectId: ID!) {
    getReleases(projectId: $projectId) {
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
`)

export const GET_RELEASE = graphql(`
  query GetRelease($id: ID!) {
    getRelease(id: $id) {
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
        aiDraftStatus
        projectId
        createdAt
        updatedAt
      }
      features {
        feature {
          id
          name
          kind
          suggested
          currentState
          tags
        }
        state
        clientAvailabilityKey
        flagState {
          staging
          production
        }
        prs {
          id
          number
          title
          body
          author
          mergedAt
          releaseId
          featureId
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

export const EXPORT_SUMMARY = graphql(`
  query ExportSummary($input: ExportSummaryInput!) {
    exportSummary(input: $input) {
      url
      filename
    }
  }
`)

export const SUGGEST_FEATURE_FOR_PR = graphql(`
  query SuggestFeatureForPr($prId: ID!) {
    suggestFeatureForPr(prId: $prId) {
      featureId
      confidence
      rationale
    }
  }
`)

export const GENERATE_SUMMARY = graphql(`
  subscription GenerateSummary($input: GenerateSummaryInput!) {
    generateSummary(input: $input) {
      chunk
      done
    }
  }
`)



export const GITHUB_BRANCHES = graphql(`
  query GithubBranches($projectId: ID!) {
    githubBranches(projectId: $projectId) {
      name
      protected
      commitSha
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

export const DIFF_REFS = graphql(`
  query DiffRefs($projectId: ID!, $baseRef: String!, $compareRef: String!) {
    diffRefs(projectId: $projectId, baseRef: $baseRef, compareRef: $compareRef) {
      id
      number
      title
      body
      author
      mergedAt
      releaseId
      featureId
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
  }
`)
