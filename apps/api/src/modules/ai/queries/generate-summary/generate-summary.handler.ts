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
import { featureStateToClientLine } from '../../prompts/availability-line'
import type { SummaryChunkType } from '../../types/summary-chunk.type'
import { GenerateSummaryQuery } from './generate-summary.query'

@QueryHandler(GenerateSummaryQuery)
export class GenerateSummaryHandler extends BaseQueryHandler<
  GenerateSummaryQuery,
  AsyncIterable<SummaryChunkType>
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
    query: GenerateSummaryQuery,
    tx: TxClient,
  ): Promise<AsyncIterable<SummaryChunkType>> {
    const releaseContext = await this.aiRepository.findReleaseContext(
      query.releaseId,
      tx,
      query.featureIds ?? undefined,
    )

    if (!releaseContext) {
      throw new NotFoundException('Release')
    }

    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: query.userId,
        projectId: releaseContext.projectId,
        action: Action.READ,
        subjectKind: Subject.RELEASE,
      },
      tx,
    )

    const releaseTitle = releaseContext.name || releaseContext.compareRef

    return this.aiProvider.streamSummary({
      releaseTitle,
      tone: query.tone,
      model: query.model,
      features: releaseContext.features.map((f) => ({
        featureId: f.id,
        name: f.name,
        description: f.description,
        statusLine: featureStateToClientLine(f.state, f.flagStaging, f.flagProduction),
        prSummaries: f.prSummaries,
      })),
    })
  }
}
