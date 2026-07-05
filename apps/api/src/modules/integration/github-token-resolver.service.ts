import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { GithubAuthMode } from '@release-hub/db'
import { NotFoundException } from '../../common/errors'
import { AppException } from '../../common/errors/app.exception'
import { ErrorCode } from '../../common/errors/error-codes.enum'
import { decryptToken } from '../../common/crypto/token-cipher'
import { IProjectRepository } from '../project/interfaces/project.repository'
import { IOrganizationRepository } from '../organization/interfaces/organization.repository'
import { IGithubConnectionRepository } from '../github-auth/interfaces/github-connection.repository'
import { IGithubTokenResolver } from './interfaces/github-token-resolver.abstract'
import { IGithubAppAuth } from './interfaces/github-app-auth.abstract'

@Injectable()
export class GithubTokenResolverService extends IGithubTokenResolver {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly githubAppAuth: IGithubAppAuth,
  ) {
    super()
  }

  async resolveForProject(projectId: string, userId: string | null, tx: TxClient): Promise<string> {
    const project = await this.projectRepository.findById(projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const organizationId = await this.organizationRepository.findOrganizationIdForProject(projectId, tx)
    if (organizationId) {
      const installationId = await this.organizationRepository.findActiveInstallationIdForOrg(
        organizationId,
        tx,
      )
      if (installationId) {
        return this.githubAppAuth.getInstallationToken(Number(installationId))
      }
    }

    if (project.githubAuthMode === GithubAuthMode.oauth && userId) {
      const connection = await this.githubConnectionRepository.findByUserId(userId, tx)
      if (connection) {
        return decryptToken(connection.accessToken)
      }
    }

    throw new AppException(
      'GitHub App is not installed for this organization.',
      ErrorCode.GITHUB_APP_NOT_CONFIGURED,
    )
  }
}
