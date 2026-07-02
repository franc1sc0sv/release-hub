import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { randomBytes } from 'crypto'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ConnectionSettingsType } from '../../types/connection-settings.type'
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
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: RotateGithubWebhookSecretCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ConnectionSettingsType> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: command.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const secret = randomBytes(WEBHOOK_SECRET_BYTES).toString('hex')
    await this.projectRepository.regenerateGithubWebhookSecret(command.projectId, secret, tx)

    const credentials = await this.projectRepository.findCredentials(command.projectId, tx)
    const webhookSecretStatus = await this.projectRepository.findWebhookSecretStatus(command.projectId, tx)

    const settings = new ConnectionSettingsType()
    settings.githubConnected = project.githubInstallationId !== null
    settings.linearConnected = project.linearEnabled
    settings.flagsmithConnected = project.flagsmithEnabled
    settings.flagsmithUrl = credentials?.flagsmithUrl ?? null
    settings.flagsmithProjectId = credentials?.flagsmithProjectId ?? null
    settings.flagsmithWebhookSecretSet = webhookSecretStatus?.flagsmithWebhookSecretSet ?? false
    settings.flagsmithWebhookPath = `/webhooks/flagsmith/${command.projectId}`
    settings.githubWebhookSecretSet = true
    settings.githubWebhookPath = `/webhooks/github/${command.projectId}`
    return settings
  }
}
