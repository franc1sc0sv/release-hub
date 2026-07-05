import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ILogger } from '../../../../common/logging/logging.abstract'
import { LogEvent } from '../../../../common/logging/log-event.enum'
import { AiDraftStatus } from '../../../../common/types/ai-draft-status.enum'
import { NotFoundException } from '../../../../common/errors'
import { Action, Subject } from '@release-hub/shared'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { AiDraftRunner } from '../../services/ai-draft-runner.service'
import { ReleaseObjectType } from '../../../release/types/release.type'
import { toReleaseObjectType } from '../../../release/types/release.mappers'
import { RegenerateDraftCommand } from './regenerate-draft.command'

@CommandHandler(RegenerateDraftCommand)
export class RegenerateDraftHandler implements ICommandHandler<RegenerateDraftCommand, ReleaseObjectType> {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly orgRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly draftRunner: AiDraftRunner,
  ) {}

  async execute(command: RegenerateDraftCommand): Promise<ReleaseObjectType> {
    const release = await this.db.$transaction(async (tx) => {
      const release = await this.releaseRepository.findById(command.releaseId, tx)
      if (!release) throw new NotFoundException('Release')

      await authorizeProjectAction(
        this.orgRepository,
        {
          actorId: command.userId,
          projectId: release.projectId,
          action: Action.UPDATE,
          subjectKind: Subject.RELEASE,
        },
        tx,
      )

      return release
    })

    this.logger.info(
      {
        event: LogEvent.AI_DRAFT_REGENERATE,
        releaseId: command.releaseId,
        projectId: release.projectId,
        userId: command.userId,
      },
      LogEvent.AI_DRAFT_REGENERATE,
    )

    const updated = await this.db.$transaction((tx) =>
      this.releaseRepository.updateAiDraftStatus(command.releaseId, AiDraftStatus.RUNNING, tx),
    )

    this.draftRunner.run(command.releaseId, release.projectId, { resume: command.resume }).catch((err: unknown) => {
      this.logger.error(
        {
          event: LogEvent.AI_DRAFT_FAILED,
          releaseId: command.releaseId,
          projectId: release.projectId,
          err: err instanceof Error ? err.message : String(err),
        },
        LogEvent.AI_DRAFT_FAILED,
      )
      this.db
        .$transaction((tx) =>
          this.releaseRepository.updateAiDraftStatus(
            command.releaseId,
            AiDraftStatus.FAILED,
            tx,
          ),
        )
        .catch(() => undefined)
    })

    return toReleaseObjectType(updated)
  }
}
