import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IGithubAppAuth } from '../../../integration/interfaces/github-app-auth.abstract'
import type { IGithubRepository } from '../../../integration/interfaces/github-client.interface'
import { GetInstallationRepositoriesQuery } from './get-installation-repositories.query'

@QueryHandler(GetInstallationRepositoriesQuery)
export class GetInstallationRepositoriesHandler extends BaseQueryHandler<
  GetInstallationRepositoriesQuery,
  IGithubRepository[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly githubAppAuth: IGithubAppAuth,
  ) {
    super(db)
  }

  protected async handle(
    query: GetInstallationRepositoriesQuery,
    tx: TxClient,
  ): Promise<IGithubRepository[]> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: query.actorId,
        organizationId: query.organizationId,
        action: Action.READ,
        subjectKind: Subject.ORGANIZATION,
      },
      tx,
    )

    const installationId = await this.organizationRepository.findActiveInstallationIdForOrg(
      query.organizationId,
      tx,
    )
    if (!installationId) {
      throw new AppException(
        'GitHub App is not installed for this organization.',
        ErrorCode.GITHUB_APP_NOT_CONFIGURED,
      )
    }

    return this.githubAppAuth.listInstallationRepositories(Number(installationId))
  }
}
