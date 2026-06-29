export interface IGitHubCommit {
  sha: string
  message: string
  author: string
  committedAt: Date
}

export interface IGitHubMergedPr {
  number: number
  title: string
  body: string | null
  author: string
  mergedAt: Date
  commits: IGitHubCommit[]
}

export interface IGitHubOpenPrResult {
  url: string
  number: number
}

export interface IGitHubCreateTagResult {
  tag: string
}

export interface IGithubRepository {
  fullName: string
  name: string
  owner: string
  private: boolean
  defaultBranch: string
  description: string | null
  htmlUrl: string
}

export interface IGitHubBranch {
  name: string
  protected: boolean
  commitSha: string
}

export interface IGitHubRefCommit {
  sha: string
  message: string
  author: string
  committedAt: string
}

export interface IGitHubRefComparison {
  aheadBy: number
  behindBy: number
  totalCommits: number
  commits: IGitHubRefCommit[]
}

export abstract class IGitHubClient {
  abstract compareMergedPullRequests(
    repo: string,
    baseRef: string,
    compareRef: string,
    accessToken: string,
  ): Promise<IGitHubMergedPr[]>

  abstract openReleasePullRequest(
    repo: string,
    baseRef: string,
    compareRef: string,
    title: string,
    body: string,
    accessToken: string,
  ): Promise<IGitHubOpenPrResult>

  abstract createReleaseTag(
    repo: string,
    tag: string,
    sha: string,
    accessToken: string,
  ): Promise<IGitHubCreateTagResult>

  abstract getRefSha(repo: string, ref: string, accessToken: string): Promise<string>

  abstract listUserRepositories(accessToken: string): Promise<IGithubRepository[]>

  abstract listBranches(repo: string, accessToken: string): Promise<IGitHubBranch[]>

  abstract createBranch(
    repo: string,
    newBranchName: string,
    fromRef: string,
    accessToken: string,
  ): Promise<IGitHubBranch>

  abstract compareRefs(
    repo: string,
    baseRef: string,
    compareRef: string,
    accessToken: string,
  ): Promise<IGitHubRefComparison>

  abstract revokeAuthorization(accessToken: string): Promise<void>
}
