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
import { IPullRequestRepository } from '../../../release/interfaces/pull-request.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { PrAssignedToFeatureEvent } from '../../events/pr-assigned-to-feature.event'
import { AssignPrToFeatureCommand } from './assign-pr-to-feature.command'

@CommandHandler(AssignPrToFeatureCommand)
export class AssignPrToFeatureHandler extends BaseCommandHandler<AssignPrToFeatureCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureRepository: IFeatureRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: AssignPrToFeatureCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<boolean> {
    const pr = await this.pullRequestRepository.findById(command.prId, tx)
    if (!pr) throw new NotFoundException('PullRequest')

    const release = await this.releaseRepository.findById(pr.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    const projectId = release.projectId

    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PULL_REQUEST,
        __type: Subject.PULL_REQUEST,
        projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const feature = await this.featureRepository.findById(command.featureId, tx)
    if (!feature) throw new NotFoundException('Feature')

    if (feature.projectId !== projectId) {
      throw new ForbiddenException()
    }

    await this.pullRequestRepository.assignToFeature(command.prId, command.featureId, tx)

    events.push(new PrAssignedToFeatureEvent(command.prId, command.featureId, projectId))

    return true
  }
}
