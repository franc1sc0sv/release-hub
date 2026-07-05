import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ConflictException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectTagRepository } from '../../../project-tag/interfaces/project-tag.repository'
import { IFeatureRepository } from '../../interfaces/feature.repository'
import { FeatureType } from '../../types/feature.type'
import { toFeatureType } from '../../types/feature.mappers'
import { FeatureCreatedEvent } from '../../events/feature-created.event'
import { CreateFeatureCommand } from './create-feature.command'

@CommandHandler(CreateFeatureCommand)
export class CreateFeatureHandler extends BaseCommandHandler<CreateFeatureCommand, FeatureType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly projectTagRepository: IProjectTagRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateFeatureCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<FeatureType> {
    await authorizeProjectAction(
      this.orgRepository,
      { actorId: command.userId, projectId: command.projectId, action: Action.CREATE, subjectKind: Subject.FEATURE },
      tx,
    )

    const normalised = command.tags
      ? [...new Set(command.tags.map((t) => t.trim()).filter((t) => t.length > 0).map((t) => t.toLowerCase()))]
      : []

    if (normalised.length > 0) {
      const allExist = await this.projectTagRepository.existsByNames(command.projectId, normalised, tx)
      if (!allExist) {
        throw new ConflictException('One or more tags do not exist in the project taxonomy')
      }
    }

    const feature = await this.featureRepository.create(
      {
        projectId: command.projectId,
        name: command.name,
        description: command.description,
        createdById: command.userId,
        tags: normalised,
      },
      tx,
    )

    events.push(new FeatureCreatedEvent(feature.id, feature.projectId))

    return toFeatureType(feature)
  }
}
