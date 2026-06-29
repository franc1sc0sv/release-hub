import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
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
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SaveReleaseSummaryCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ReleaseObjectType> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const updated = await this.releaseRepository.updateSummary(command.releaseId, command.summary, tx)

    return toReleaseObjectType(updated)
  }
}
