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
} from './interfaces/github-client.interface'

@Injectable()
export class GitHubClient extends IGitHubClient {
  private readonly logger = new Logger(GitHubClient.name)

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

    const octokit = new Octokit({ auth: accessToken })
    try {
      const branches = await octokit.paginate(
        octokit.repos.listBranches,
        { owner, repo: repoName, per_page: 100 },
        (response) => response.data,
      )
      return branches.map((branch) => ({
        name: branch.name,
        protected: branch.protected,
        commitSha: branch.commit.sha,
      }))
    } catch (error) {
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
