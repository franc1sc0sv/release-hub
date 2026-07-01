import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { FlagRegistryConfigType } from '../../types/flag-registry-config.type'
import { SetFlagRegistryCommand } from './set-flag-registry.command'

@CommandHandler(SetFlagRegistryCommand)
export class SetFlagRegistryHandler extends BaseCommandHandler<SetFlagRegistryCommand, FlagRegistryConfigType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: SetFlagRegistryCommand, tx: TxClient): Promise<FlagRegistryConfigType> {
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

    const result = await this.projectRepository.updateFlagRegistry(
      command.projectId,
      { flagRegistryPath: command.path, flagRegistryBranch: command.branch },
      tx,
    )

    const type = new FlagRegistryConfigType()
    type.projectId = result.projectId
    type.flagRegistryPath = result.flagRegistryPath
    type.flagRegistryBranch = result.flagRegistryBranch
    return type
  }
}
