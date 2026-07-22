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
import { ISummaryProfileRepository } from '../../interfaces/summary-profile.repository'
import { SummaryProfileType } from '../../types/summary-profile.type'
import { toSummaryProfileType } from '../../types/summary-profile.mappers'
import { UpdateSummaryProfileCommand } from './update-summary-profile.command'

@CommandHandler(UpdateSummaryProfileCommand)
export class UpdateSummaryProfileHandler extends BaseCommandHandler<UpdateSummaryProfileCommand, SummaryProfileType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly summaryProfileRepository: ISummaryProfileRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: UpdateSummaryProfileCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<SummaryProfileType> {
    const profile = await this.summaryProfileRepository.findById(command.profileId, tx)
    if (!profile) throw new NotFoundException('SummaryProfile')

    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: command.userId,
        projectId: profile.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.SUMMARY_PROFILE,
      },
      tx,
    )

    const trimmedName = command.name.trim()
    if (trimmedName.length === 0) {
      throw new ConflictException('Profile name cannot be blank')
    }

    const existing = await this.summaryProfileRepository.listByProject(profile.projectId, tx)
    const duplicate = existing.some(
      (other) => other.id !== command.profileId && other.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    if (duplicate) {
      throw new ConflictException(`Summary profile "${trimmedName}" already exists in this project`)
    }

    const updated = await this.summaryProfileRepository.update(
      command.profileId,
      {
        name: trimmedName,
        description: command.description,
        outputTemplate: command.outputTemplate,
        rules: command.rules,
        examples: command.examples,
      },
      tx,
    )

    return toSummaryProfileType(updated)
  }
}
