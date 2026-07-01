import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IReleaseFlagDecisionRepository } from '../../interfaces/release-flag-decision.repository'
import { ReleaseFlagDecisionResultType } from '../../types/release-flag-decision.type'
import { SetReleaseFlagDecisionCommand } from './set-release-flag-decision.command'

@CommandHandler(SetReleaseFlagDecisionCommand)
export class SetReleaseFlagDecisionHandler extends BaseCommandHandler<
  SetReleaseFlagDecisionCommand,
  ReleaseFlagDecisionResultType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly releaseFlagDecisionRepository: IReleaseFlagDecisionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SetReleaseFlagDecisionCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ReleaseFlagDecisionResultType> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const decision = await this.releaseFlagDecisionRepository.upsertByReleaseAndFlag(
      {
        releaseId: command.releaseId,
        trackedFlagId: command.trackedFlagId,
        decision: command.decision,
        decidedById: command.userId,
        decidedAt: new Date(),
      },
      tx,
    )

    const result = new ReleaseFlagDecisionResultType()
    result.id = decision.id
    result.releaseId = decision.releaseId
    result.trackedFlagId = decision.trackedFlagId
    result.decision = decision.decision
    result.decidedById = decision.decidedById
    result.decidedAt = decision.decidedAt
    return result
  }
}
