import { CommandHandler } from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import { Action, Subject } from '@release-hub/shared'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
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
    private readonly orgRepository: IOrganizationRepository,
    private readonly aiRepository: IAiRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly aiProvider: IAiProvider,
  ) {}

  async execute(command: GeneratePrSummaryCommand): Promise<PullRequestType> {
    const prContext = await this.db.$transaction((tx) =>
      this.aiRepository.findPullRequestContext(command.prId, tx),
    )
    if (!prContext) throw new NotFoundException('PullRequest')

    await this.db.$transaction((tx) =>
      authorizeProjectAction(
        this.orgRepository,
        {
          actorId: command.userId,
          projectId: prContext.projectId,
          action: Action.UPDATE,
          subjectKind: Subject.PULL_REQUEST,
        },
        tx,
      ),
    )

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
