import { CommandHandler } from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IPullRequestRepository } from '../../../release/interfaces/pull-request.repository'
import { IAiRepository } from '../../interfaces/ai.repository'
import { IAiProvider } from '../../interfaces/ai-provider.abstract'
import { PullRequestType } from '../../../release/types/pull-request.type'
import { toPullRequestType } from '../../../release/types/release.mappers'
import { GeneratePrSummaryCommand } from './generate-pr-summary.command'

@CommandHandler(GeneratePrSummaryCommand)
export class GeneratePrSummaryHandler {
  constructor(
    private readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly aiRepository: IAiRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly aiProvider: IAiProvider,
  ) {}

  async execute(command: GeneratePrSummaryCommand): Promise<PullRequestType> {
    const prContext = await this.db.$transaction((tx) =>
      this.aiRepository.findPullRequestContext(command.prId, tx),
    )
    if (!prContext) throw new NotFoundException('PullRequest')

    const memberships = await this.db.$transaction((tx) =>
      this.projectRepository.findMembershipsForUser(command.userId, tx),
    )
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PULL_REQUEST,
        __type: Subject.PULL_REQUEST,
        projectId: prContext.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const result = await this.aiProvider.summarizePullRequest({
      prTitle: prContext.title,
      prBody: prContext.body,
      commitMessages: prContext.commitMessages,
      tickets: prContext.tickets,
    })

    const updated = await this.db.$transaction((tx) =>
      this.pullRequestRepository.updateSummary(command.prId, result.summary, null, tx),
    )

    return toPullRequestType(updated)
  }
}
