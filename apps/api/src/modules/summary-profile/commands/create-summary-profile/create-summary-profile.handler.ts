import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException, ConflictException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ISummaryProfileRepository } from '../../interfaces/summary-profile.repository'
import { SummaryProfileType } from '../../types/summary-profile.type'
import { toSummaryProfileType } from '../../types/summary-profile.mappers'
import { CreateSummaryProfileCommand } from './create-summary-profile.command'

@CommandHandler(CreateSummaryProfileCommand)
export class CreateSummaryProfileHandler extends BaseCommandHandler<CreateSummaryProfileCommand, SummaryProfileType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly summaryProfileRepository: ISummaryProfileRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateSummaryProfileCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<SummaryProfileType> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: command.userId,
        projectId: command.projectId,
        action: Action.CREATE,
        subjectKind: Subject.SUMMARY_PROFILE,
      },
      tx,
    )

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const trimmedName = command.name.trim()
    if (trimmedName.length === 0) {
      throw new ConflictException('Profile name cannot be blank')
    }

    const existing = await this.summaryProfileRepository.listByProject(command.projectId, tx)
    const duplicate = existing.some((profile) => profile.name.toLowerCase() === trimmedName.toLowerCase())
    if (duplicate) {
      throw new ConflictException(`Summary profile "${trimmedName}" already exists in this project`)
    }

    const profile = await this.summaryProfileRepository.create(
      {
        projectId: command.projectId,
        name: trimmedName,
        description: command.description,
        outputTemplate: command.outputTemplate,
        rules: command.rules,
        examples: command.examples,
      },
      tx,
    )

    return toSummaryProfileType(profile)
  }
}
