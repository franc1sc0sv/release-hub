import { Injectable, Logger } from '@nestjs/common'
import { Octokit } from '@octokit/rest'
import { AppException } from '../../common/errors/app.exception'
import { ErrorCode } from '../../common/errors/error-codes.enum'
import {
  IGitHubClient,
  type IGitHubMergedPr,
  type IGitHubCommit,
  type IGitHubOpenPrResult,
  type IGitHubCreateTagResult,
  type IGithubRepository,
  type IGitHubBranch,
  type IGitHubRefComparison,
  type IGitHubFileTree,
  type IGitHubPullRequestFile,
  type IGitHubBranchSearchResult,
  type IGitHubBranchSearchItem,
  type IGitHubMergedPullRequestHead,
  type IGitHubOpenPullRequestHead,
  type IGitHubDeleteBranchResult,
  type IGitHubDeployment,
  type IGitHubDeploymentStatus,
  type IGitHubBranchCommitDetail,
} from './interfaces/github-client.interface'

interface ICacheEntry<T> {
  at: number
  value: T
}

interface IGitHubGraphqlCommitAuthor {
  name: string | null
  avatarUrl: string | null
  user: { login: string | null } | null
}

interface IGitHubGraphqlRefTarget {
  committedDate: string
  author: IGitHubGraphqlCommitAuthor | null
}

interface IGitHubGraphqlRef {
  target: IGitHubGraphqlRefTarget | null
}

interface IGitHubBranchCommitsGraphqlResponse {
  repository: Record<string, IGitHubGraphqlRef | null> | null
}

const BRANCH_LIST_CACHE_TTL_MS = 60_000
const MERGED_HEADS_CACHE_TTL_MS = 60_000
const OPEN_HEADS_CACHE_TTL_MS = 60_000
const BRANCH_COMMIT_CACHE_TTL_MS = 60_000
const DEFAULT_BRANCH_CACHE_TTL_MS = 600_000
const BRANCH_COMMIT_GRAPHQL_CHUNK_SIZE = 50

@Injectable()
export class GitHubClient extends IGitHubClient {
  private readonly logger = new Logger(GitHubClient.name)

  private readonly branchesCache = new Map<string, ICacheEntry<IGitHubBranch[]>>()
  private readonly mergedHeadsCache = new Map<string, ICacheEntry<IGitHubMergedPullRequestHead[]>>()
  private readonly openHeadsCache = new Map<string, ICacheEntry<IGitHubOpenPullRequestHead[]>>()
  private readonly defaultBranchCache = new Map<string, ICacheEntry<string>>()
  private readonly branchCommitCache = new Map<
    string,
    Map<string, ICacheEntry<IGitHubBranchCommitDetail | null>>
  >()

  private readCache<T>(cache: Map<string, ICacheEntry<T>>, key: string, ttlMs: number): T | undefined {
    const entry = cache.get(key)
    if (!entry) return undefined
    if (Date.now() - entry.at > ttlMs) {
      cache.delete(key)
      return undefined
    }
    return entry.value
  }

  private writeCache<T>(cache: Map<string, ICacheEntry<T>>, key: string, value: T): void {
    cache.set(key, { at: Date.now(), value })
  }

  private readBranchCommitCache(repo: string, branchName: string): IGitHubBranchCommitDetail | null | undefined {
    const repoCache = this.branchCommitCache.get(repo)
    if (!repoCache) return undefined
    return this.readCache(repoCache, branchName, BRANCH_COMMIT_CACHE_TTL_MS)
  }

  private writeBranchCommitCache(
    repo: string,
    branchName: string,
    value: IGitHubBranchCommitDetail | null,
  ): void {
    let repoCache = this.branchCommitCache.get(repo)
    if (!repoCache) {
      repoCache = new Map<string, ICacheEntry<IGitHubBranchCommitDetail | null>>()
      this.branchCommitCache.set(repo, repoCache)
    }
    this.writeCache(repoCache, branchName, value)
  }

  private clearBranchCaches(repo: string): void {
    this.branchesCache.delete(repo)
    this.mergedHeadsCache.delete(repo)
    this.openHeadsCache.delete(repo)
    this.branchCommitCache.delete(repo)
  }

  async revokeAuthorization(accessToken: string): Promise<void> {
    const clientId = process.env.GITHUB_APP_CLIENT_ID
    const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET
    if (!clientId || !clientSecret) return
    const octokit = new Octokit()
    try {
      await octokit.request('DELETE /applications/{client_id}/grant', {
        client_id: clientId,
        access_token: accessToken,
        headers: {
          authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      })
    } catch (error) {
      this.logger.warn('GitHub grant revocation failed — proceeding with re-authorization', { error })
    }
  }

  async compareMergedPullRequests(
    repo: string,
    baseRef: string,
    compareRef: string,
    accessToken: string,
  ): Promise<IGitHubMergedPr[]> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })

    let compareData: Awaited<ReturnType<typeof octokit.repos.compareCommitsWithBasehead>>['data']
    try {
      const response = await octokit.repos.compareCommitsWithBasehead({
        owner,
        repo: repoName,
        basehead: `${baseRef}...${compareRef}`,
        per_page: 250,
      })
      compareData = response.data
    } catch (error) {
      this.mapOctokitError(error)
    }

    const commitShas = new Set(compareData.commits.map((c) => c.sha))
    if (commitShas.size === 0) return []

    const mergedPrs = await this.fetchPrsForCommits(
      octokit,
      owner,
      repoName,
      compareData.commits,
    )

    return mergedPrs.filter((pr) =>
      pr.commits.some((c) => commitShas.has(c.sha)),
    )
  }

  async openReleasePullRequest(
    repo: string,
    baseRef: string,
    compareRef: string,
    title: string,
    body: string,
    accessToken: string,
  ): Promise<IGitHubOpenPrResult> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      const response = await octokit.pulls.create({
        owner,
        repo: repoName,
        head: compareRef,
        base: baseRef,
        title,
        body,
      })
      return { url: response.data.html_url, number: response.data.number }
    } catch (error) {
      const existing = await this.findOpenReleasePullRequest(
        octokit,
        owner,
        repoName,
        baseRef,
        compareRef,
      )
      if (existing) return existing
      this.mapOctokitError(error)
    }
  }

  private async findOpenReleasePullRequest(
    octokit: Octokit,
    owner: string,
    repoName: string,
    baseRef: string,
    compareRef: string,
  ): Promise<IGitHubOpenPrResult | null> {
    try {
      const response = await octokit.pulls.list({
        owner,
        repo: repoName,
        base: baseRef,
        head: `${owner}:${compareRef}`,
        state: 'open',
      })
      const existing = response.data[0]
      return existing ? { url: existing.html_url, number: existing.number } : null
    } catch {
      return null
    }
  }

  async getRefSha(repo: string, ref: string, accessToken: string): Promise<string> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      const response = await octokit.repos.getBranch({ owner, repo: repoName, branch: ref })
      return response.data.commit.sha
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async createReleaseTag(
    repo: string,
    tag: string,
    sha: string,
    accessToken: string,
  ): Promise<IGitHubCreateTagResult> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      await octokit.git.createRef({
        owner,
        repo: repoName,
        ref: `refs/tags/${tag}`,
        sha,
      })
    } catch (error) {
      this.mapOctokitError(error)
    }

    return { tag }
  }

  async listUserRepositories(accessToken: string): Promise<IGithubRepository[]> {
    const octokit = new Octokit({ auth: accessToken })
    try {
      const repos = await octokit.paginate(
        octokit.repos.listForAuthenticatedUser,
        { sort: 'updated', per_page: 100, affiliation: 'owner,collaborator,organization_member' },
        (response, done) => {
          if (response.data.length >= 200) done()
          return response.data
        },
      )
      return repos.slice(0, 200).map((repo) => ({
        githubId: repo.id,
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner.login,
        private: repo.private,
        defaultBranch: repo.default_branch,
        description: repo.description ?? null,
        htmlUrl: repo.html_url,
      }))
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async listBranches(repo: string, accessToken: string): Promise<IGitHubBranch[]> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const cached = this.readCache(this.branchesCache, repo, BRANCH_LIST_CACHE_TTL_MS)
    if (cached) return cached

    const octokit = new Octokit({ auth: accessToken })
    try {
      const branches = await octokit.paginate(
        octokit.repos.listBranches,
        { owner, repo: repoName, per_page: 100 },
        (response) => response.data,
      )
      const result = branches.map((branch) => ({
        name: branch.name,
        protected: branch.protected,
        commitSha: branch.commit.sha,
      }))
      this.writeCache(this.branchesCache, repo, result)
      return result
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async searchBranches(
    repo: string,
    search: string | null,
    limit: number,
    accessToken: string,
  ): Promise<IGitHubBranchSearchResult> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    const needle = search?.toLowerCase() ?? null
    const items: IGitHubBranchSearchItem[] = []
    let hasMore = false

    try {
      for await (const response of octokit.paginate.iterator(octokit.repos.listBranches, {
        owner,
        repo: repoName,
        per_page: 100,
      })) {
        for (const branch of response.data) {
          if (needle !== null && !branch.name.toLowerCase().includes(needle)) continue

          if (items.length >= limit) {
            hasMore = true
            break
          }

          items.push({
            name: branch.name,
            protected: branch.protected,
            lastCommitSha: branch.commit.sha,
          })
        }

        if (items.length >= limit) break
      }
    } catch (error) {
      this.mapOctokitError(error)
    }

    return { items, hasMore }
  }

  async listMergedPullRequestHeads(
    repo: string,
    accessToken: string,
  ): Promise<IGitHubMergedPullRequestHead[]> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const cached = this.readCache(this.mergedHeadsCache, repo, MERGED_HEADS_CACHE_TTL_MS)
    if (cached) return cached

    const octokit = new Octokit({ auth: accessToken })
    const maxResults = 500
    const heads: IGitHubMergedPullRequestHead[] = []

    try {
      for await (const response of octokit.paginate.iterator(octokit.pulls.list, {
        owner,
        repo: repoName,
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      })) {
        for (const pr of response.data) {
          if (pr.merged_at === null) continue
          heads.push({ headRef: pr.head.ref, mergedAt: pr.merged_at, prNumber: pr.number })
          if (heads.length >= maxResults) break
        }
        if (heads.length >= maxResults) break
      }
    } catch (error) {
      this.mapOctokitError(error)
    }

    this.writeCache(this.mergedHeadsCache, repo, heads)
    return heads
  }

  async listOpenPullRequestHeads(
    repo: string,
    accessToken: string,
  ): Promise<IGitHubOpenPullRequestHead[]> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const cached = this.readCache(this.openHeadsCache, repo, OPEN_HEADS_CACHE_TTL_MS)
    if (cached) return cached

    const octokit = new Octokit({ auth: accessToken })
    try {
      const prs = await octokit.paginate(
        octokit.pulls.list,
        { owner, repo: repoName, state: 'open', per_page: 100 },
        (response) => response.data,
      )
      const result = prs.map((pr) => ({ headRef: pr.head.ref, prNumber: pr.number }))
      this.writeCache(this.openHeadsCache, repo, result)
      return result
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async deleteBranch(
    repo: string,
    branchName: string,
    accessToken: string,
  ): Promise<IGitHubDeleteBranchResult> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      await octokit.git.deleteRef({ owner, repo: repoName, ref: `heads/${branchName}` })
      this.clearBranchCaches(repo)
      return { deleted: true }
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 404) {
        return { deleted: false, reason: 'Branch not found' }
      }
      if (status === 422) {
        return { deleted: false, reason: 'Branch is protected or the reference could not be deleted' }
      }
      if (status === 403) {
        return { deleted: false, reason: 'Insufficient permissions to delete this branch' }
      }
      return { deleted: false, reason: (error as { message?: string }).message ?? 'Unknown error' }
    }
  }

  async listDeployments(
    repo: string,
    accessToken: string,
    ref?: string,
  ): Promise<IGitHubDeployment[]> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      const deployments = await octokit.paginate(
        octokit.repos.listDeployments,
        { owner, repo: repoName, ref, per_page: 100 },
        (response) => response.data,
      )
      return deployments.map((deployment) => ({
        id: deployment.id,
        ref: deployment.ref,
        sha: deployment.sha,
        environment: deployment.environment,
        createdAt: deployment.created_at,
      }))
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async getLatestDeploymentStatus(
    repo: string,
    deploymentId: number,
    accessToken: string,
  ): Promise<IGitHubDeploymentStatus | null> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      const response = await octokit.repos.listDeploymentStatuses({
        owner,
        repo: repoName,
        deployment_id: deploymentId,
        per_page: 1,
      })
      const latest = response.data[0]
      if (!latest) return null
      return {
        state: latest.state,
        environment: latest.environment,
        createdAt: latest.created_at,
      }
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 404) return null
      this.mapOctokitError(error)
    }
  }

  async createBranch(
    repo: string,
    newBranchName: string,
    fromRef: string,
    accessToken: string,
  ): Promise<IGitHubBranch> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    const sha = await this.getRefSha(repo, fromRef, accessToken)

    let canPush = false
    try {
      const repoInfo = await octokit.repos.get({ owner, repo: repoName })
      canPush = repoInfo.data.permissions?.push ?? false
    } catch (error) {
      this.mapOctokitError(error)
    }
    if (!canPush) {
      throw new AppException(
        `Your GitHub account does not have write access to ${repo}, so a branch cannot be created. Reconnect GitHub or pick a repository you can push to.`,
        ErrorCode.FORBIDDEN,
      )
    }

    try {
      await octokit.git.createRef({
        owner,
        repo: repoName,
        ref: `refs/heads/${newBranchName}`,
        sha,
      })
    } catch (error) {
      this.mapOctokitError(error)
    }

    this.clearBranchCaches(repo)
    return { name: newBranchName, protected: false, commitSha: sha }
  }

  async compareRefs(
    repo: string,
    baseRef: string,
    compareRef: string,
    accessToken: string,
  ): Promise<IGitHubRefComparison> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      const response = await octokit.repos.compareCommitsWithBasehead({
        owner,
        repo: repoName,
        basehead: `${baseRef}...${compareRef}`,
        per_page: 250,
      })
      const data = response.data
      return {
        aheadBy: data.ahead_by,
        behindBy: data.behind_by,
        totalCommits: data.total_commits,
        commits: data.commits.map((commit) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.author?.login ?? commit.commit.author?.name ?? 'unknown',
          committedAt: commit.commit.author?.date ?? new Date().toISOString(),
        })),
      }
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async getDefaultBranch(repo: string, accessToken: string): Promise<string> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const cached = this.readCache(this.defaultBranchCache, repo, DEFAULT_BRANCH_CACHE_TTL_MS)
    if (cached) return cached

    const octokit = new Octokit({ auth: accessToken })
    try {
      const response = await octokit.repos.get({ owner, repo: repoName })
      const result = response.data.default_branch
      this.writeCache(this.defaultBranchCache, repo, result)
      return result
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async getFileTree(repo: string, ref: string, accessToken: string): Promise<IGitHubFileTree> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    const headSha = await this.resolveHeadSha(octokit, owner, repoName, ref)

    try {
      const response = await octokit.git.getTree({
        owner,
        repo: repoName,
        tree_sha: headSha,
        recursive: 'true',
      })
      const paths = response.data.tree
        .filter((entry) => entry.type === 'blob' && typeof entry.path === 'string')
        .map((entry) => entry.path as string)
      return { paths, truncated: response.data.truncated ?? false }
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async getFileContent(
    repo: string,
    ref: string,
    path: string,
    accessToken: string,
  ): Promise<string | null> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      const response = await octokit.repos.getContent({ owner, repo: repoName, path, ref })
      const data = response.data
      if (Array.isArray(data) || data.type !== 'file' || typeof data.content !== 'string') {
        return null
      }
      return Buffer.from(data.content, 'base64').toString('utf8')
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 404) return null
      this.mapOctokitError(error)
    }
  }

  async listPullRequestFiles(
    repo: string,
    prNumber: number,
    accessToken: string,
  ): Promise<IGitHubPullRequestFile[]> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const octokit = new Octokit({ auth: accessToken })
    try {
      const files = await octokit.paginate(
        octokit.pulls.listFiles,
        { owner, repo: repoName, pull_number: prNumber, per_page: 100 },
        (response) => response.data,
      )
      return files.map((file) => ({
        filename: file.filename,
        status: file.status,
        patch: file.patch ?? null,
      }))
    } catch (error) {
      this.mapOctokitError(error)
    }
  }

  async getBranchCommitDetails(
    repo: string,
    branchNames: string[],
    accessToken: string,
  ): Promise<Map<string, IGitHubBranchCommitDetail | null>> {
    const [owner, repoName] = repo.split('/')
    if (!owner || !repoName) {
      throw new AppException(`Invalid repo format: ${repo}`, ErrorCode.VALIDATION_ERROR)
    }

    const result = new Map<string, IGitHubBranchCommitDetail | null>()
    const uncachedNames: string[] = []

    for (const branchName of branchNames) {
      const cached = this.readBranchCommitCache(repo, branchName)
      if (cached !== undefined) {
        result.set(branchName, cached)
      } else {
        uncachedNames.push(branchName)
      }
    }

    if (uncachedNames.length === 0) return result

    const octokit = new Octokit({ auth: accessToken })

    for (let i = 0; i < uncachedNames.length; i += BRANCH_COMMIT_GRAPHQL_CHUNK_SIZE) {
      const chunk = uncachedNames.slice(i, i + BRANCH_COMMIT_GRAPHQL_CHUNK_SIZE)
      const chunkDetails = await this.fetchBranchCommitDetailsChunk(octokit, owner, repoName, chunk)
      for (const branchName of chunk) {
        const detail = chunkDetails.get(branchName) ?? null
        this.writeBranchCommitCache(repo, branchName, detail)
        result.set(branchName, detail)
      }
    }

    return result
  }

  private async fetchBranchCommitDetailsChunk(
    octokit: Octokit,
    owner: string,
    repoName: string,
    branchNames: string[],
  ): Promise<Map<string, IGitHubBranchCommitDetail>> {
    const aliases = branchNames.map((_, index) => `b${index}`)
    const refFields = aliases
      .map(
        (alias) =>
          `${alias}: ref(qualifiedName: $${alias}) { target { ... on Commit { committedDate author { name avatarUrl user { login } } } } }`,
      )
      .join('\n')
    const query = `query GetBranchCommitDetails($owner: String!, $name: String!, ${aliases
      .map((alias) => `$${alias}: String!`)
      .join(', ')}) {
      repository(owner: $owner, name: $name) {
        ${refFields}
      }
    }`

    const variables: Record<string, string> = { owner, name: repoName }
    branchNames.forEach((branchName, index) => {
      variables[aliases[index]] = `refs/heads/${branchName}`
    })

    const result = new Map<string, IGitHubBranchCommitDetail>()

    try {
      const response = await octokit.graphql<IGitHubBranchCommitsGraphqlResponse>(query, variables)
      const repository = response.repository
      if (!repository) return result

      branchNames.forEach((branchName, index) => {
        const target = repository[aliases[index]]?.target ?? null
        if (!target) return
        result.set(branchName, {
          committedAt: new Date(target.committedDate),
          authorLogin: target.author?.user?.login ?? null,
          authorName: target.author?.name ?? null,
          authorAvatarUrl: target.author?.avatarUrl ?? null,
        })
      })
    } catch (error) {
      this.mapOctokitError(error)
    }

    return result
  }

  private async resolveHeadSha(
    octokit: Octokit,
    owner: string,
    repoName: string,
    ref: string,
  ): Promise<string> {
    try {
      const response = await octokit.repos.getBranch({ owner, repo: repoName, branch: ref })
      return response.data.commit.sha
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 404) return ref
      this.mapOctokitError(error)
    }
  }

  private async fetchPrsForCommits(
    octokit: Octokit,
    owner: string,
    repo: string,
    commits: { sha: string; commit: { message: string; author: { name?: string | null; date?: string | null } | null }; author: { login?: string } | null }[],
  ): Promise<IGitHubMergedPr[]> {
    const prMap = new Map<number, IGitHubMergedPr>()

    for (const commit of commits) {
      let prsForCommit: { number: number; title: string; body: string | null; user: { login: string } | null; merged_at: string | null }[]
      try {
        const response = await octokit.repos.listPullRequestsAssociatedWithCommit({
          owner,
          repo,
          commit_sha: commit.sha,
        })
        prsForCommit = response.data.filter((pr) => pr.merged_at !== null) as typeof prsForCommit
      } catch {
        continue
      }

      for (const pr of prsForCommit) {
        if (prMap.has(pr.number)) {
          const existing = prMap.get(pr.number)!
          const commitEntry = this.toCommit(commit)
          if (!existing.commits.some((c) => c.sha === commitEntry.sha)) {
            existing.commits.push(commitEntry)
          }
          continue
        }

        const commitEntry = this.toCommit(commit)
        prMap.set(pr.number, {
          number: pr.number,
          title: pr.title,
          body: pr.body ?? null,
          author: pr.user?.login ?? 'unknown',
          mergedAt: new Date(pr.merged_at!),
          commits: [commitEntry],
        })
      }
    }

    return Array.from(prMap.values())
  }

  private toCommit(
    commit: { sha: string; commit: { message: string; author: { name?: string | null; date?: string | null } | null }; author: { login?: string } | null },
  ): IGitHubCommit {
    return {
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.author?.login ?? commit.commit.author?.name ?? 'unknown',
      committedAt: new Date(commit.commit.author?.date ?? new Date()),
    }
  }

  private mapOctokitError(error: unknown): never {
    const e = error as {
      status?: number
      message?: string
      response?: { data?: { message?: string; errors?: Array<{ message?: string }> } }
    }
    const status = typeof e.status === 'number' ? e.status : null
    const detail = e.response?.data?.errors
      ?.map((item) => item.message)
      .filter((message): message is string => typeof message === 'string' && message.length > 0)
      .join('; ')
    const githubMessage =
      (detail && detail.length > 0 ? detail : undefined) ??
      e.response?.data?.message ??
      e.message ??
      'unknown error'

    if (status === 404) {
      throw new AppException(
        `GitHub returned 404 (${githubMessage}). The repository or ref was not found, or your GitHub account lacks write access to this repository.`,
        ErrorCode.NOT_FOUND,
      )
    }
    if (status === 401 || status === 403) {
      throw new AppException(`GitHub permission denied (${status}): ${githubMessage}`, ErrorCode.FORBIDDEN)
    }
    if (status === 422) {
      throw new AppException(
        `GitHub rejected the request (422): ${githubMessage}`,
        ErrorCode.VALIDATION_ERROR,
      )
    }
    if (status === 429) {
      throw new AppException('GitHub rate limit exceeded. Please try again later.', ErrorCode.VALIDATION_ERROR)
    }
    throw new AppException(
      `GitHub API error${status !== null ? ` (${status})` : ''}: ${githubMessage}`,
      ErrorCode.VALIDATION_ERROR,
    )
  }
}
