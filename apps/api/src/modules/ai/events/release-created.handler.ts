import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import { IReleaseRepository } from '../../release/interfaces/release.repository'
import { IPullRequestRepository } from '../../release/interfaces/pull-request.repository'
import { IFeatureRepository } from '../../feature/interfaces/feature.repository'
import { IAiRepository } from '../interfaces/ai.repository'
import { IAiProvider } from '../interfaces/ai-provider.abstract'
import type { ReleaseCreatedEvent } from '../../release/events/release-created.event'
import type { IAiFeatureContext } from '../interfaces/ai.repository'

const CONFIDENCE_THRESHOLD = 0.5

@Injectable()
export class AiDraftReleaseCreatedHandler {
  private readonly logger = new Logger(AiDraftReleaseCreatedHandler.name)

  constructor(
    private readonly db: IDatabaseService,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly aiRepository: IAiRepository,
    private readonly aiProvider: IAiProvider,
  ) {}

  @OnEvent('release.created')
  async onReleaseCreated(event: ReleaseCreatedEvent): Promise<void> {
    try {
      await this.runDraft(event.releaseId, event.projectId)
    } catch (error) {
      this.logger.error(
        `AI draft failed for release ${event.releaseId}: ${error instanceof Error ? error.message : String(error)}`,
      )
      await this.db.$transaction((tx) =>
        this.releaseRepository.updateAiDraftStatus(event.releaseId, AiDraftStatus.FAILED, tx),
      )
    }
  }

  private async runDraft(releaseId: string, projectId: string): Promise<void> {
    await this.db.$transaction((tx) =>
      this.releaseRepository.updateAiDraftStatus(releaseId, AiDraftStatus.RUNNING, tx),
    )

    const [prs, featureCandidates] = await this.db.$transaction((tx) =>
      Promise.all([
        this.pullRequestRepository.findAllByRelease(releaseId, tx),
        this.aiRepository.findFeaturesForProject(projectId, tx),
      ]),
    )

    const suggestedByName = new Map<string, string>()

    for (const pr of prs) {
      await this.processPr(pr.id, projectId, featureCandidates, suggestedByName)
    }

    await this.db.$transaction((tx) =>
      this.releaseRepository.updateAiDraftStatus(releaseId, AiDraftStatus.READY, tx),
    )
  }

  private async processPr(
    prId: string,
    projectId: string,
    featureCandidates: IAiFeatureContext[],
    suggestedByName: Map<string, string>,
  ): Promise<void> {
    const prContext = await this.db.$transaction((tx) =>
      this.aiRepository.findPullRequestContext(prId, tx),
    )
    if (!prContext) return

    const [suggestion, prSummaryResult] = await Promise.all([
      this.aiProvider.suggest({
        prTitle: prContext.title,
        prBranch: prContext.branchName,
        prBody: prContext.body,
        commitMessages: prContext.commitMessages,
        changedPaths: prContext.changedPaths,
        linkedTicketTitle: prContext.linkedTicketTitle,
        features: featureCandidates.map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          kind: f.kind,
          tags: f.tags,
        })),
      }),
      this.aiProvider.summarizePullRequest({
        prTitle: prContext.title,
        prBody: prContext.body,
        commitMessages: prContext.commitMessages,
        tickets: prContext.tickets,
      }).catch((err: unknown) => {
        this.logger.error(
          `PR summary generation failed for ${prId}: ${err instanceof Error ? err.message : String(err)}`,
        )
        return null
      }),
    ])

    const matchedCandidate = featureCandidates.find((f) => f.id === suggestion.featureId)

    if (matchedCandidate && suggestion.confidence >= CONFIDENCE_THRESHOLD) {
      await this.db.$transaction((tx) =>
        this.pullRequestRepository.updateAiFields(
          prId,
          {
            featureId: matchedCandidate.id,
            aiConfidence: suggestion.confidence,
            aiRationale: suggestion.rationale,
          },
          tx,
        ),
      )
    } else {
      const suggestedName = this.deriveSuggestedName(prContext.title, prContext.linkedTicketTitle)
      const existingSuggestedId = suggestedByName.get(suggestedName.toLowerCase())

      if (existingSuggestedId) {
        await this.db.$transaction((tx) =>
          this.pullRequestRepository.updateAiFields(
            prId,
            {
              featureId: existingSuggestedId,
              aiConfidence: suggestion.confidence,
              aiRationale: suggestion.rationale,
            },
            tx,
          ),
        )
      } else {
        const newFeatureId = await this.db.$transaction(async (tx) => {
          const newFeature = await this.featureRepository.createSuggested(
            {
              projectId,
              name: suggestedName,
              description: this.deriveDescription(
                prContext.title,
                prContext.linkedTicketTitle,
                prContext.body,
              ),
            },
            tx,
          )
          await this.pullRequestRepository.updateAiFields(
            prId,
            {
              featureId: newFeature.id,
              aiConfidence: suggestion.confidence,
              aiRationale: suggestion.rationale,
            },
            tx,
          )
          return newFeature.id
        })
        suggestedByName.set(suggestedName.toLowerCase(), newFeatureId)
      }
    }

    if (prSummaryResult && prSummaryResult.summary.trim().length > 0) {
      try {
        await this.db.$transaction((tx) =>
          this.pullRequestRepository.updateSummary(prId, prSummaryResult.summary, null, tx),
        )
      } catch (err: unknown) {
        this.logger.error(
          `Failed to store PR summary for ${prId}: ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }
  }

  private deriveSuggestedName(prTitle: string, ticketTitle: string | null): string {
    if (ticketTitle && ticketTitle.trim().length > 0) {
      return ticketTitle.trim().slice(0, 100)
    }
    return prTitle.trim().slice(0, 100)
  }

  private deriveDescription(
    prTitle: string,
    ticketTitle: string | null,
    prBody: string | null,
  ): string {
    const parts: string[] = []
    if (ticketTitle) parts.push(ticketTitle.trim())
    if (prTitle) parts.push(prTitle.trim())
    if (prBody) parts.push(prBody.trim().slice(0, 300))
    return parts.join(' — ').slice(0, 500)
  }
}
