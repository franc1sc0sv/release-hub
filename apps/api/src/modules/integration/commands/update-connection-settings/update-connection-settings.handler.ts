import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ConnectionSettingsType } from '../../types/connection-settings.type'
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
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: UpdateConnectionSettingsCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ConnectionSettingsType> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    const projectSubject = {
      kind: Subject.PROJECT,
      __type: Subject.PROJECT,
      projectId: command.projectId,
    }
    if (!ability.can(Action.UPDATE, projectSubject)) {
      throw new ForbiddenException()
    }

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

    const settings = new ConnectionSettingsType()
    settings.githubConnected = updated.githubInstallationId !== null
    settings.linearConnected = updated.linearEnabled
    settings.flagsmithConnected = updated.flagsmithEnabled

    const credentials = await this.projectRepository.findCredentials(command.projectId, tx)
    settings.flagsmithUrl = credentials?.flagsmithUrl ?? null
    settings.flagsmithProjectId = credentials?.flagsmithProjectId ?? null
    return settings
  }
}
