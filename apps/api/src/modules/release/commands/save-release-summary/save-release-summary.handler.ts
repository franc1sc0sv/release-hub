import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { sanitizeSummaryHtml } from '../../../../common/text/sanitize-summary-html'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { SaveReleaseSummaryCommand } from './save-release-summary.command'

@CommandHandler(SaveReleaseSummaryCommand)
export class SaveReleaseSummaryHandler extends BaseCommandHandler<
  SaveReleaseSummaryCommand,
  ReleaseObjectType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SaveReleaseSummaryCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ReleaseObjectType> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: command.userId,
        projectId: release.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.RELEASE,
      },
      tx,
    )

    const updated = await this.releaseRepository.updateSummary(
      command.releaseId,
      sanitizeSummaryHtml(command.summary),
      command.summaryProfileId,
      command.summaryModel,
      tx,
    )

    return toReleaseObjectType(updated)
  }
}
