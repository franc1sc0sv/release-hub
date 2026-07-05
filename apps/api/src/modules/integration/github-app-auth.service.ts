import { Injectable } from '@nestjs/common'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { AppException } from '../../common/errors/app.exception'
import { ErrorCode } from '../../common/errors/error-codes.enum'
import { IGithubAppAuth, type IGithubInstallationInfo } from './interfaces/github-app-auth.abstract'
import type { IGithubRepository } from './interfaces/github-client.interface'

interface ICachedInstallationToken {
  token: string
  expiresAt: number
}

const TOKEN_REFRESH_SKEW_MS = 5 * 60 * 1000

@Injectable()
export class GithubAppAuthService extends IGithubAppAuth {
  private readonly tokenCache = new Map<number, ICachedInstallationToken>()

  private appAuthInstance: ReturnType<typeof createAppAuth> | null = null

  private getAppAuth(): ReturnType<typeof createAppAuth> {
    if (this.appAuthInstance) return this.appAuthInstance

    const appId = process.env.GITHUB_APP_ID
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY
    if (!appId || !privateKey) {
      throw new AppException(
        'GitHub App is not configured. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY.',
        ErrorCode.GITHUB_APP_NOT_CONFIGURED,
      )
    }

    this.appAuthInstance = createAppAuth({ appId, privateKey })
    return this.appAuthInstance
  }

  async getInstallationToken(installationId: number): Promise<string> {
    const cached = this.tokenCache.get(installationId)
    if (cached && Date.now() < cached.expiresAt - TOKEN_REFRESH_SKEW_MS) {
      return cached.token
    }

    const authentication = await this.getAppAuth()({ type: 'installation', installationId })
    this.tokenCache.set(installationId, {
      token: authentication.token,
      expiresAt: new Date(authentication.expiresAt).getTime(),
    })
    return authentication.token
  }

  async getInstallation(installationId: number): Promise<IGithubInstallationInfo> {
    const appAuthentication = await this.getAppAuth()({ type: 'app' })
    const octokit = new Octokit({ auth: appAuthentication.token })
    const { data } = await octokit.request('GET /app/installations/{installation_id}', {
      installation_id: installationId,
    })
    const account = data.account
    return {
      installationId: data.id,
      accountLogin: account && 'login' in account ? account.login : '',
      accountType: data.target_type,
      accountId: data.target_id,
      repositorySelection: data.repository_selection,
    }
  }

  async listInstallationRepositories(installationId: number): Promise<IGithubRepository[]> {
    const token = await this.getInstallationToken(installationId)
    const octokit = new Octokit({ auth: token })
    const repos = await octokit.paginate(octokit.apps.listReposAccessibleToInstallation, {
      per_page: 100,
    })
    return repos.map((repo) => ({
      githubId: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      owner: repo.owner.login,
      private: repo.private,
      defaultBranch: repo.default_branch,
      description: repo.description ?? null,
      htmlUrl: repo.html_url,
    }))
  }
}
