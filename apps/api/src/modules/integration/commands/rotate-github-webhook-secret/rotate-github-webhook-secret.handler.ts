import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { randomBytes } from 'crypto'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ConnectionSettingsType } from '../../types/connection-settings.type'
import { toConnectionSettings } from '../../types/connection-settings.mappers'
import { RotateGithubWebhookSecretCommand } from './rotate-github-webhook-secret.command'

const WEBHOOK_SECRET_BYTES = 32

@CommandHandler(RotateGithubWebhookSecretCommand)
export class RotateGithubWebhookSecretHandler extends BaseCommandHandler<
  RotateGithubWebhookSecretCommand,
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
    command: RotateGithubWebhookSecretCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ConnectionSettingsType> {
    const organizationId = await authorizeProjectAction(
      this.organizationRepository,
      { actorId: command.userId, projectId: command.projectId, action: Action.UPDATE, subjectKind: Subject.PROJECT },
      tx,
    )

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const secret = randomBytes(WEBHOOK_SECRET_BYTES).toString('hex')
    await this.projectRepository.regenerateGithubWebhookSecret(command.projectId, secret, tx)

    const credentials = await this.projectRepository.findCredentials(command.projectId, tx)
    const webhookSecretStatus = await this.projectRepository.findWebhookSecretStatus(command.projectId, tx)

    const orgHasActiveInstallation =
      (await this.organizationRepository.findActiveInstallationIdForOrg(organizationId, tx)) !== null

    return toConnectionSettings({
      projectId: command.projectId,
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
