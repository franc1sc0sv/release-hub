import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { ISummaryProfileRepository } from '../../interfaces/summary-profile.repository'
import { DeleteSummaryProfileCommand } from './delete-summary-profile.command'

@CommandHandler(DeleteSummaryProfileCommand)
export class DeleteSummaryProfileHandler extends BaseCommandHandler<DeleteSummaryProfileCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly summaryProfileRepository: ISummaryProfileRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DeleteSummaryProfileCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    const profile = await this.summaryProfileRepository.findById(command.profileId, tx)
    if (!profile) throw new NotFoundException('SummaryProfile')

    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: command.userId,
        projectId: profile.projectId,
        action: Action.DELETE,
        subjectKind: Subject.SUMMARY_PROFILE,
      },
      tx,
    )

    await this.summaryProfileRepository.softDelete(command.profileId, tx)

    return true
  }
}
