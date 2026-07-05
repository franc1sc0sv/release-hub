import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ConnectionSettingsType } from '../../types/connection-settings.type'
import { toConnectionSettings } from '../../types/connection-settings.mappers'
import { FlagsmithConnectedEvent } from '../../events/flagsmith-connected.event'
import { UpdateConnectionSettingsCommand } from './update-connection-settings.command'
import type { IDomainEvent } from '../../../../common/cqrs/types'

@CommandHandler(UpdateConnectionSettingsCommand)
export class UpdateConnectionSettingsHandler extends BaseCommandHandler<
  UpdateConnectionSettingsCommand,
  ConnectionSettingsType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: UpdateConnectionSettingsCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ConnectionSettingsType> {
    const organizationId = await authorizeProjectAction(
      this.organizationRepository,
      { actorId: command.userId, projectId: command.projectId, action: Action.UPDATE, subjectKind: Subject.PROJECT },
      tx,
    )

    const existing = await this.projectRepository.findById(command.projectId, tx)
    if (!existing) throw new NotFoundException('Project')

    const updated = await this.projectRepository.updateIntegrationSettings(
      command.projectId,
      {
        flagsmithApiKey: command.flagsmithApiKey,
        flagsmithUrl: command.flagsmithUrl,
        flagsmithProjectId: command.flagsmithProjectId,
      },
      tx,
    )

    const credentials = await this.projectRepository.findCredentials(command.projectId, tx)
    const webhookSecretStatus = await this.projectRepository.findWebhookSecretStatus(command.projectId, tx)

    const orgHasActiveInstallation =
      (await this.organizationRepository.findActiveInstallationIdForOrg(organizationId, tx)) !== null

    const settings = toConnectionSettings({
      projectId: command.projectId,
      githubAuthMode: updated.githubAuthMode,
      githubInstallationId: updated.githubInstallationId,
      linearEnabled: updated.linearEnabled,
      flagsmithEnabled: updated.flagsmithEnabled,
      orgHasActiveInstallation,
      credentials,
      webhookSecretStatus,
    })

    const flagsmithJustConnected =
      !existing.flagsmithEnabled &&
      updated.flagsmithEnabled &&
      command.flagsmithApiKey !== undefined &&
      command.flagsmithUrl !== undefined &&
      command.flagsmithProjectId !== undefined

    if (flagsmithJustConnected) {
      events.push(new FlagsmithConnectedEvent(command.projectId))
    }

    return settings
  }
}
