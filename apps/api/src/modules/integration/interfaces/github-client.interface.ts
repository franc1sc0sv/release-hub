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
  githubId: number
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

export interface IGitHubFileTree {
  paths: string[]
  truncated: boolean
}

export interface IGitHubPullRequestFile {
  filename: string
  status: string
  patch: string | null
}

export interface IGitHubBranchSearchItem {
  name: string
  protected: boolean
  lastCommitSha: string
  lastCommitDate?: string
}

export interface IGitHubBranchSearchResult {
  items: IGitHubBranchSearchItem[]
  hasMore: boolean
}

export interface IGitHubMergedPullRequestHead {
  headRef: string
  mergedAt: string
  prNumber: number
}

export interface IGitHubOpenPullRequestHead {
  headRef: string
  prNumber: number
}

export interface IGitHubDeleteBranchResult {
  deleted: boolean
  reason?: string
}

export interface IGitHubDeployment {
  id: number
  ref: string
  sha: string
  environment: string
  createdAt: string
}

export interface IGitHubDeploymentStatus {
  state: string
  environment?: string
  createdAt: string
}

export interface IGitHubBranchCommitDetail {
  committedAt: Date
  authorLogin: string | null
  authorName: string | null
  authorAvatarUrl: string | null
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

  abstract getDefaultBranch(repo: string, accessToken: string): Promise<string>

  abstract getFileTree(repo: string, ref: string, accessToken: string): Promise<IGitHubFileTree>

  abstract getFileContent(
    repo: string,
    ref: string,
    path: string,
    accessToken: string,
  ): Promise<string | null>

  abstract listPullRequestFiles(
    repo: string,
    prNumber: number,
    accessToken: string,
  ): Promise<IGitHubPullRequestFile[]>

  abstract revokeAuthorization(accessToken: string): Promise<void>

  abstract searchBranches(
    repo: string,
    search: string | null,
    limit: number,
    accessToken: string,
  ): Promise<IGitHubBranchSearchResult>

  abstract listMergedPullRequestHeads(
    repo: string,
    accessToken: string,
  ): Promise<IGitHubMergedPullRequestHead[]>

  abstract listOpenPullRequestHeads(
    repo: string,
    accessToken: string,
  ): Promise<IGitHubOpenPullRequestHead[]>

  abstract deleteBranch(
    repo: string,
    branchName: string,
    accessToken: string,
  ): Promise<IGitHubDeleteBranchResult>

  abstract listDeployments(
    repo: string,
    accessToken: string,
    ref?: string,
  ): Promise<IGitHubDeployment[]>

  abstract getLatestDeploymentStatus(
    repo: string,
    deploymentId: number,
    accessToken: string,
  ): Promise<IGitHubDeploymentStatus | null>

  abstract getBranchCommitDetails(
    repo: string,
    branchNames: string[],
    accessToken: string,
  ): Promise<Map<string, IGitHubBranchCommitDetail | null>>
}
