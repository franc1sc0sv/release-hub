import { QueryHandler } from '@nestjs/cqrs'
import { NotFoundException } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IAiRepository } from '../../interfaces/ai.repository'
import { IAiProvider } from '../../interfaces/ai-provider.abstract'
import { AiSuggestionType } from '../../types/ai-suggestion.type'
import { SuggestFeatureForPrQuery } from './suggest-feature-for-pr.query'

@QueryHandler(SuggestFeatureForPrQuery)
export class SuggestFeatureForPrHandler extends BaseQueryHandler<
  SuggestFeatureForPrQuery,
  AiSuggestionType
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly aiRepository: IAiRepository,
    private readonly aiProvider: IAiProvider,
  ) {
    super(db)
  }

  protected async handle(
    query: SuggestFeatureForPrQuery,
    tx: TxClient,
  ): Promise<AiSuggestionType> {
    const pr = await this.aiRepository.findPullRequestContext(query.prId, tx)

    if (!pr) {
      throw new NotFoundException('PullRequest')
    }

    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: query.userId,
        projectId: pr.projectId,
        action: Action.READ,
        subjectKind: Subject.PULL_REQUEST,
      },
      tx,
    )

    const features = await this.aiRepository.findFeaturesForProject(
      pr.projectId,
      tx,
    )

    const result = await this.aiProvider.suggest({
      prTitle: pr.title,
      prBranch: pr.branchName,
      prBody: pr.body,
      commitMessages: pr.commitMessages,
      changedPaths: pr.changedPaths,
      linkedTicketTitle: pr.linkedTicketTitle,
      features: features.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        kind: f.kind,
        tags: f.tags,
      })),
    })

    const suggestion = new AiSuggestionType()
    suggestion.featureId = result.featureId
    suggestion.confidence = result.confidence
    suggestion.rationale = result.rationale
    return suggestion
  }
}
