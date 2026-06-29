import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException, ConflictException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IProjectTagRepository } from '../../interfaces/project-tag.repository'
import { ProjectTagType } from '../../types/project-tag.type'
import { CreateProjectTagCommand } from './create-project-tag.command'

@CommandHandler(CreateProjectTagCommand)
export class CreateProjectTagHandler extends BaseCommandHandler<CreateProjectTagCommand, ProjectTagType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly projectTagRepository: IProjectTagRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateProjectTagCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ProjectTagType> {
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

    const normalizedName = command.name.trim().toLowerCase()
    if (normalizedName.length === 0) {
      throw new ConflictException('Tag name cannot be blank')
    }

    const existing = await this.projectTagRepository.listByProject(command.projectId, tx)
    const duplicate = existing.some((tag) => tag.name === normalizedName)
    if (duplicate) {
      throw new ConflictException(`Tag "${normalizedName}" already exists in this project`)
    }

    const tag = await this.projectTagRepository.create(
      { projectId: command.projectId, name: normalizedName, color: command.color ?? null },
      tx,
    )

    const result = new ProjectTagType()
    result.id = tag.id
    result.name = tag.name
    result.color = tag.color
    result.createdAt = tag.createdAt
    return result
  }
}
