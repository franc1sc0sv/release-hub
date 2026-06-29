import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ILinearConnectionRepository } from '../../interfaces/linear-connection.repository'
import type { IProjectLinearConnection } from '../../interfaces/linear-connection.interfaces'
import { ConnectLinearCommand } from './connect-linear.command'

@CommandHandler(ConnectLinearCommand)
export class ConnectLinearHandler extends BaseCommandHandler<ConnectLinearCommand, IProjectLinearConnection> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly linearConnectionRepository: ILinearConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: ConnectLinearCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IProjectLinearConnection> {
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

    const connection = await this.linearConnectionRepository.upsertForProject(
      {
        projectId: command.projectId,
        encryptedAccessToken: command.encryptedAccessToken,
        encryptedRefreshToken: command.encryptedRefreshToken,
        expiresAt: command.expiresAt,
        linearUserId: command.linearUserId,
        linearUserName: command.linearUserName,
        scopes: command.scopes,
      },
      tx,
    )

    await this.projectRepository.updateIntegrationSettings(
      command.projectId,
      { linearEnabled: true },
      tx,
    )

    return connection
  }
}
