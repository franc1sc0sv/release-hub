import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IPullRequestRepository } from '../../interfaces/pull-request.repository'
import { PullRequestType } from '../../types/pull-request.type'
import { toPullRequestType } from '../../types/release.mappers'
import { SavePrSummaryCommand } from './save-pr-summary.command'

@CommandHandler(SavePrSummaryCommand)
export class SavePrSummaryHandler extends BaseCommandHandler<SavePrSummaryCommand, PullRequestType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SavePrSummaryCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<PullRequestType> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    const pr = await this.pullRequestRepository.findById(command.prId, tx)
    if (!pr) throw new NotFoundException('PullRequest')

    const releaseProjectId = await tx.release.findFirst({
      where: { id: pr.releaseId, deletedAt: null },
      select: { projectId: true },
    }).then((r) => r?.projectId ?? null)

    if (!releaseProjectId) throw new NotFoundException('Release')

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PULL_REQUEST,
        __type: Subject.PULL_REQUEST,
        projectId: releaseProjectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const updated = await this.pullRequestRepository.updateSummary(
      command.prId,
      command.summary,
      new Date(),
      tx,
    )

    return toPullRequestType(updated)
  }
}
