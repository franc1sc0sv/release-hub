import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ConnectionSettingsType } from '../../types/connection-settings.type'
import { toConnectionSettings } from '../../types/connection-settings.mappers'
import { GetConnectionSettingsQuery } from './get-connection-settings.query'

@QueryHandler(GetConnectionSettingsQuery)
export class GetConnectionSettingsHandler extends BaseQueryHandler<
  GetConnectionSettingsQuery,
  ConnectionSettingsType
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetConnectionSettingsQuery,
    tx: TxClient,
  ): Promise<ConnectionSettingsType> {
    const organizationId = await authorizeProjectAction(
      this.organizationRepository,
      { actorId: query.userId, projectId: query.projectId, action: Action.READ, subjectKind: Subject.PROJECT },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const credentials = await this.projectRepository.findCredentials(query.projectId, tx)
    const webhookSecretStatus = await this.projectRepository.findWebhookSecretStatus(query.projectId, tx)

    const orgHasActiveInstallation =
      (await this.organizationRepository.findActiveInstallationIdForOrg(organizationId, tx)) !== null

    return toConnectionSettings({
      projectId: query.projectId,
      githubAuthMode: project.githubAuthMode,
      githubInstallationId: project.githubInstallationId,
      linearEnabled: project.linearEnabled,
      flagsmithEnabled: project.flagsmithEnabled,
      orgHasActiveInstallation,
      credentials,
      webhookSecretStatus,
    })
  }
}
