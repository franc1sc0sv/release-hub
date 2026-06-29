import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IProjectTagRepository } from '../../interfaces/project-tag.repository'
import { DeleteProjectTagCommand } from './delete-project-tag.command'

@CommandHandler(DeleteProjectTagCommand)
export class DeleteProjectTagHandler extends BaseCommandHandler<DeleteProjectTagCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly projectTagRepository: IProjectTagRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DeleteProjectTagCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    const tag = await this.projectTagRepository.findById(command.tagId, tx)
    if (!tag) throw new NotFoundException('ProjectTag')

    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: tag.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const features = await tx.feature.findMany({
      where: { projectId: tag.projectId, deletedAt: null, tags: { has: tag.name } },
      select: { id: true, tags: true },
    })

    for (const feature of features) {
      await tx.feature.update({
        where: { id: feature.id },
        data: { tags: feature.tags.filter((t) => t !== tag.name) },
      })
    }

    await this.projectTagRepository.softDelete(command.tagId, tx)

    return true
  }
}
