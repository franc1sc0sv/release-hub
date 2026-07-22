import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { AiSummaryStatus } from '../../../../common/types/ai-summary-status.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IAiRepository } from '../../interfaces/ai.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { ReleaseObjectType } from '../../../release/types/release.type'
import { toReleaseObjectType } from '../../../release/types/release.mappers'
import { ReleaseSummaryRequestedEvent } from '../../events/release-summary-requested.event'
import { StartSummaryGenerationCommand } from './start-summary-generation.command'

interface IPreparedStartSummaryGeneration {
  projectId: string
}

@CommandHandler(StartSummaryGenerationCommand)
export class StartSummaryGenerationHandler extends PreparedCommandHandler<
  StartSummaryGenerationCommand,
  IPreparedStartSummaryGeneration,
  ReleaseObjectType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly aiRepository: IAiRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(
    command: StartSummaryGenerationCommand,
  ): Promise<IPreparedStartSummaryGeneration> {
    return this.db.$transaction(async (tx) => {
      const releaseContext = await this.aiRepository.findReleaseContext(
        command.releaseId,
        tx,
        command.featureIds ?? undefined,
      )

      if (!releaseContext) {
        throw new NotFoundException('Release')
      }

      await authorizeProjectAction(
        this.organizationRepository,
        {
          actorId: command.userId,
          projectId: releaseContext.projectId,
          action: Action.UPDATE,
          subjectKind: Subject.RELEASE,
        },
        tx,
      )

      return { projectId: releaseContext.projectId }
    })
  }

  protected async handle(
    command: StartSummaryGenerationCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: IPreparedStartSummaryGeneration,
  ): Promise<ReleaseObjectType> {
    const updated = await this.releaseRepository.updateSummaryStatus(
      command.releaseId,
      AiSummaryStatus.GENERATING,
      tx,
    )

    events.push(
      new ReleaseSummaryRequestedEvent(
        command.releaseId,
        prepared.projectId,
        command.model,
        command.summaryProfileId,
        command.featureIds,
      ),
    )

    return toReleaseObjectType(updated)
  }
}
