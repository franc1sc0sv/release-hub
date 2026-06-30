import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ILogger } from '../../../../common/logging/logging.abstract'
import { LogEvent } from '../../../../common/logging/log-event.enum'
import { AiDraftStatus } from '../../../../common/types/ai-draft-status.enum'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
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
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly draftRunner: AiDraftRunner,
  ) {}

  async execute(command: RegenerateDraftCommand): Promise<ReleaseObjectType> {
    const [memberships, release] = await this.db.$transaction((tx) =>
      Promise.all([
        this.projectRepository.findMembershipsForUser(command.userId, tx),
        this.releaseRepository.findById(command.releaseId, tx),
      ]),
    )

    if (!release) throw new NotFoundException('Release')

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
