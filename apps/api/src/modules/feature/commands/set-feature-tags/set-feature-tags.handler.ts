import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException, ConflictException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IProjectTagRepository } from '../../../project-tag/interfaces/project-tag.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { FeatureType } from '../../types/feature.type'
import { toFeatureType } from '../../types/feature.mappers'
import { FeatureTagsChangedEvent } from '../../events/feature-tags-changed.event'
import { SetFeatureTagsCommand } from './set-feature-tags.command'

@CommandHandler(SetFeatureTagsCommand)
export class SetFeatureTagsHandler extends BaseCommandHandler<SetFeatureTagsCommand, FeatureType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly projectTagRepository: IProjectTagRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SetFeatureTagsCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<FeatureType> {
    const feature = await this.featureRepository.findById(command.featureId, tx)
    if (!feature) throw new NotFoundException('Feature')

    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.FEATURE,
        __type: Subject.FEATURE,
        projectId: feature.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const normalised = [
      ...new Set(command.tags.map((t) => t.trim()).filter((t) => t.length > 0).map((t) => t.toLowerCase())),
    ]

    if (normalised.length > 0) {
      const allExist = await this.projectTagRepository.existsByNames(feature.projectId, normalised, tx)
      if (!allExist) {
        throw new ConflictException('One or more tags do not exist in the project taxonomy')
      }
    }

    const updated = await this.featureRepository.update(command.featureId, { tags: normalised }, tx)

    events.push(new FeatureTagsChangedEvent(command.featureId, normalised))

    return toFeatureType(updated)
  }
}
