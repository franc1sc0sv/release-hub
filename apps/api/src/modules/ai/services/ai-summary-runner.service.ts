import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { FeatureKind } from '@release-hub/db'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { AiSummaryStatus } from '../../../common/types/ai-summary-status.enum'
import { FeatureState } from '../../../common/types/feature-state.enum'
import { SummaryExampleKind } from '../../../common/types/summary-example-kind.enum'
import { NotFoundException, ForbiddenException } from '../../../common/errors'
import { sanitizeSummaryHtml } from '../../../common/text/sanitize-summary-html'
import { IReleaseRepository } from '../../release/interfaces/release.repository'
import { ISummaryProfileRepository } from '../../summary-profile/interfaces/summary-profile.repository'
import { IAiRepository } from '../interfaces/ai.repository'
import type { IAiReleaseContext } from '../interfaces/ai.repository'
import { IAiProvider } from '../interfaces/ai-provider.abstract'
import type { IAiSummaryProfile } from '../interfaces/ai-provider.abstract'
import { featureStateToClientLine } from '../prompts/availability-line'

const UNRELEASED_STATES = new Set<string>([
  FeatureState.IN_PROGRESS,
  FeatureState.SHIPPED_FLAG_OFF,
  FeatureState.BLOCKED,
])

interface IAiSummaryRunOptions {
  model: string | null
  summaryProfileId: string | null
  featureIds: string[] | null
}

@Injectable()
export class AiSummaryRunner {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly releaseRepository: IReleaseRepository,
    private readonly summaryProfileRepository: ISummaryProfileRepository,
    private readonly aiRepository: IAiRepository,
    private readonly aiProvider: IAiProvider,
  ) {}

  async run(releaseId: string, options: IAiSummaryRunOptions): Promise<void> {
    const { releaseContext, profile } = await this.db.$transaction(async (tx) => {
      const releaseContext = await this.aiRepository.findReleaseContext(
        releaseId,
        tx,
        options.featureIds ?? undefined,
      )

      if (!releaseContext) {
        throw new NotFoundException('Release')
      }

      const profile = await this.loadProfile(options.summaryProfileId, releaseContext.projectId, tx)

      return { releaseContext, profile }
    })

    this.logger.info(
      { event: LogEvent.AI_SUMMARY_STARTED, releaseId, projectId: releaseContext.projectId },
      LogEvent.AI_SUMMARY_STARTED,
    )

    const accumulated = await this.streamSummary(releaseContext, profile, options.model)

    await this.db.$transaction(async (tx) => {
      await this.releaseRepository.updateSummary(
        releaseId,
        sanitizeSummaryHtml(accumulated),
        options.summaryProfileId,
        options.model,
        tx,
      )
      await this.releaseRepository.updateSummaryStatus(releaseId, AiSummaryStatus.READY, tx)
    })

    this.logger.info(
      {
        event: LogEvent.AI_SUMMARY_COMPLETED,
        releaseId,
        projectId: releaseContext.projectId,
        status: AiSummaryStatus.READY,
      },
      LogEvent.AI_SUMMARY_COMPLETED,
    )
  }

  private async streamSummary(
    releaseContext: IAiReleaseContext,
    profile: IAiSummaryProfile | null,
    model: string | null,
  ): Promise<string> {
    const releaseTitle = releaseContext.name || releaseContext.compareRef

    const sourceFeatures = profile
      ? releaseContext.features.filter(
          (f) => f.kind !== FeatureKind.product || !UNRELEASED_STATES.has(f.state),
        )
      : releaseContext.features

    let accumulated = ''

    for await (const chunk of this.aiProvider.streamSummary({
      releaseTitle,
      model,
      tags: releaseContext.tags,
      profile,
      features: sourceFeatures.map((f) => ({
        featureId: f.id,
        name: f.name,
        description: f.description,
        kind: f.kind,
        statusLine: featureStateToClientLine(f.state, f.flagStaging, f.flagProduction),
        prSummaries: f.prSummaries,
      })),
    })) {
      if (chunk.chunk.length > 0) {
        accumulated += chunk.chunk
      }
    }

    return accumulated
  }

  private async loadProfile(
    summaryProfileId: string | null,
    projectId: string,
    tx: TxClient,
  ): Promise<IAiSummaryProfile | null> {
    if (!summaryProfileId) return null

    const profile = await this.summaryProfileRepository.findById(summaryProfileId, tx)
    if (!profile) {
      throw new NotFoundException('SummaryProfile')
    }
    if (profile.projectId !== projectId) {
      throw new ForbiddenException()
    }

    return {
      outputTemplate: profile.outputTemplate,
      rules: profile.rules.map((rule) => rule.content),
      goodExamples: profile.examples
        .filter((example) => example.kind === SummaryExampleKind.GOOD)
        .map((example) => ({ content: example.content, explanation: example.explanation })),
      badExamples: profile.examples
        .filter((example) => example.kind === SummaryExampleKind.BAD)
        .map((example) => ({ content: example.content, explanation: example.explanation })),
    }
  }
}
