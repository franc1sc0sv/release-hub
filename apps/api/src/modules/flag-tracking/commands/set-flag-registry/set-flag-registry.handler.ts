import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { FlagRegistryConfigType } from '../../types/flag-registry-config.type'
import { SetFlagRegistryCommand } from './set-flag-registry.command'

@CommandHandler(SetFlagRegistryCommand)
export class SetFlagRegistryHandler extends BaseCommandHandler<SetFlagRegistryCommand, FlagRegistryConfigType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: SetFlagRegistryCommand, tx: TxClient): Promise<FlagRegistryConfigType> {
    await authorizeProjectAction(
      this.organizationRepository,
      { actorId: command.userId, projectId: command.projectId, action: Action.UPDATE, subjectKind: Subject.PROJECT },
      tx,
    )

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
