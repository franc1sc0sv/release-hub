import { Injectable } from '@nestjs/common'
import { IDatabaseService } from '../../../common/database/database.abstract'
import { ILogger } from '../../../common/logging/logging.abstract'
import { LogEvent } from '../../../common/logging/log-event.enum'
import { AiDraftStatus } from '../../../common/types/ai-draft-status.enum'
import { IReleaseRepository } from '../../release/interfaces/release.repository'
import { IPullRequestRepository } from '../../release/interfaces/pull-request.repository'
import { IFeatureRepository } from '../../feature/interfaces/feature.repository'
import { IAiRepository } from '../interfaces/ai.repository'
import { IAiProvider } from '../interfaces/ai-provider.abstract'
import type { IAiFeatureContext } from '../interfaces/ai.repository'
import type { IAiUsage } from '../interfaces/ai-provider.abstract'

const CONFIDENCE_THRESHOLD = 0.5
const DRAFT_CONCURRENCY = 5

type PrOutcome = 'matched-existing-feature' | 'reused-suggested' | 'created-suggested' | 'skipped'

interface IAggregatedUsage {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheCreationTokens: number
  costUsd: number
}

function addUsage(agg: IAggregatedUsage, usage: IAiUsage | undefined): void {
  if (!usage) return
  agg.inputTokens += usage.inputTokens
  agg.outputTokens += usage.outputTokens
  agg.cacheReadTokens += usage.cacheReadTokens
  agg.cacheCreationTokens += usage.cacheCreationTokens
  agg.costUsd += usage.costUsd
}

function emptyUsage(): IAggregatedUsage {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0, costUsd: 0 }
}

async function runWithBoundedConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const iterator = items[Symbol.iterator]()
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (;;) {
      const { value, done } = iterator.next()
      if (done) break
      await fn(value as T)
    }
  })
  await Promise.all(workers)
}

@Injectable()
export class AiDraftRunner {
  constructor(
    private readonly db: IDatabaseService,
    private readonly logger: ILogger,
    private readonly releaseRepository: IReleaseRepository,
    private readonly pullRequestRepository: IPullRequestRepository,
    private readonly featureRepository: IFeatureRepository,
    private readonly aiRepository: IAiRepository,
    private readonly aiProvider: IAiProvider,
  ) {}

  async run(
    releaseId: string,
    projectId: string,
    { resume }: { resume: boolean },
  ): Promise<void> {
    await this.db.$transaction((tx) =>
      this.releaseRepository.updateAiDraftStatus(releaseId, AiDraftStatus.RUNNING, tx),
    )

    if (!resume) {
      await this.db.$transaction(async (tx) => {
        const [releasePrs, suggestedFeatures] = await Promise.all([
          this.pullRequestRepository.findAllByRelease(releaseId, tx),
          this.featureRepository.findSuggestedByProject(projectId, tx),
        ])
        const releasePrFeatureIds = new Set(
          releasePrs.map((pr) => pr.featureId).filter((id): id is string => id !== null),
        )
        const orphanedSuggestedIds = suggestedFeatures
          .filter((f) => releasePrFeatureIds.has(f.id))
          .map((f) => f.id)
        await this.pullRequestRepository.clearReleaseAssignments(releaseId, tx)
        await Promise.all(orphanedSuggestedIds.map((id) => this.featureRepository.softDelete(id, tx)))
      })
    }

    const [allPrs, featureCandidates, existingSuggested] = await this.db.$transaction((tx) =>
      Promise.all([
        this.pullRequestRepository.findAllByRelease(releaseId, tx),
        this.aiRepository.findFeaturesForProject(projectId, tx),
        resume ? this.featureRepository.findSuggestedByProject(projectId, tx) : Promise.resolve([]),
      ]),
    )

    const prs = resume ? allPrs.filter((pr) => pr.featureId == null) : allPrs

    if (resume && prs.length === 0) {
      await this.db.$transaction((tx) =>
        this.releaseRepository.updateAiDraftStatus(releaseId, AiDraftStatus.READY, tx),
      )
      this.logger.info(
        { event: LogEvent.AI_DRAFT_COMPLETED, releaseId, projectId, prCount: 0, skipped: allPrs.length, matched: 0, reused: 0, created: 0, summaryFailed: 0, ...emptyUsage() },
        LogEvent.AI_DRAFT_COMPLETED,
      )
      return
    }

    this.logger.info(
      { event: LogEvent.AI_DRAFT_STARTED, releaseId, projectId, prCount: prs.length, resume },
      LogEvent.AI_DRAFT_STARTED,
    )

    const suggestedByName = new Map<string, Promise<string>>()
    if (resume) {
      for (const f of existingSuggested) {
        suggestedByName.set(f.name.toLowerCase(), Promise.resolve(f.id))
      }
    }

    let matched = 0
    let reused = 0
    let created = 0
    let skipped = 0
    let summaryFailed = 0
    const totals = emptyUsage()

    await runWithBoundedConcurrency(prs, DRAFT_CONCURRENCY, async (pr) => {
      const { outcome, prUsage, hasSummaryFailure } = await this.processPr(
        pr.id,
        projectId,
        featureCandidates,
        suggestedByName,
      )
      if (outcome === 'matched-existing-feature') matched++
      else if (outcome === 'reused-suggested') reused++
      else if (outcome === 'created-suggested') created++
      else skipped++
      if (hasSummaryFailure) summaryFailed++
      addUsage(totals, prUsage)
    })

    await this.db.$transaction((tx) =>
      this.releaseRepository.updateAiDraftStatus(releaseId, AiDraftStatus.READY, tx),
    )

    this.logger.info(
      {
        event: LogEvent.AI_DRAFT_COMPLETED,
        releaseId,
        status: AiDraftStatus.READY,
        prCount: prs.length,
        matched,
        reused,
        created,
        skipped,
        summaryFailed,
        ...totals,
      },
      LogEvent.AI_DRAFT_COMPLETED,
    )
  }

  private async processPr(
    prId: string,
    projectId: string,
    featureCandidates: IAiFeatureContext[],
    suggestedByName: Map<string, Promise<string>>,
  ): Promise<{ outcome: PrOutcome; prUsage: IAggregatedUsage; hasSummaryFailure: boolean }> {
    const prUsage = emptyUsage()
    let hasSummaryFailure = false

    const prContext = await this.db.$transaction((tx) =>
      this.aiRepository.findPullRequestContext(prId, tx),
    )

    if (!prContext) {
      return { outcome: 'skipped', prUsage, hasSummaryFailure }
    }

    const [suggestionResult, prSummaryResult] = await Promise.all([
      this.aiProvider
        .suggest({
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
        })
        .catch((err: unknown) => {
          this.logger.warn(
            {
              event: LogEvent.AI_DRAFT_PR_PROCESSED,
              prId,
              outcome: 'suggest-failed-skipping',
              err: err instanceof Error ? err.message : String(err),
            },
            LogEvent.AI_DRAFT_PR_PROCESSED,
          )
          return null
        }),
      this.aiProvider
        .summarizePullRequest({
          prTitle: prContext.title,
          prBody: prContext.body,
          commitMessages: prContext.commitMessages,
          tickets: prContext.tickets,
        })
        .catch((err: unknown) => {
          this.logger.warn(
            {
              event: LogEvent.AI_DRAFT_PR_PROCESSED,
              prId,
              summaryOutcome: 'failed',
              err: err instanceof Error ? err.message : String(err),
            },
            LogEvent.AI_DRAFT_PR_PROCESSED,
          )
          hasSummaryFailure = true
          return null
        }),
    ])

    if (!suggestionResult) {
      return { outcome: 'skipped', prUsage, hasSummaryFailure }
    }

    addUsage(prUsage, suggestionResult.usage)
    addUsage(prUsage, prSummaryResult?.usage)

    const matchedCandidate = featureCandidates.find((f) => f.id === suggestionResult.featureId)
    let outcome: PrOutcome

    if (matchedCandidate && suggestionResult.confidence >= CONFIDENCE_THRESHOLD) {
      await this.db.$transaction((tx) =>
        this.pullRequestRepository.updateAiFields(
          prId,
          {
            featureId: matchedCandidate.id,
            aiConfidence: suggestionResult.confidence,
            aiRationale: suggestionResult.rationale,
          },
          tx,
        ),
      )
      outcome = 'matched-existing-feature'
    } else {
      const suggestedName =
        suggestionResult.suggestedFeatureName ??
        this.deriveSuggestedName(prContext.title, prContext.linkedTicketTitle)
      const key = suggestedName.toLowerCase()

      const existingPromise = suggestedByName.get(key)
      if (existingPromise) {
        const existingSuggestedId = await existingPromise
        await this.db.$transaction((tx) =>
          this.pullRequestRepository.updateAiFields(
            prId,
            {
              featureId: existingSuggestedId,
              aiConfidence: suggestionResult.confidence,
              aiRationale: suggestionResult.rationale,
            },
            tx,
          ),
        )
        outcome = 'reused-suggested'
      } else {
        const suggestedDescription =
          suggestionResult.suggestedFeatureDescription ??
          this.deriveDescription(prContext.title, prContext.linkedTicketTitle, prContext.body)
        const createPromise = this.db.$transaction(async (tx) => {
          const newFeature = await this.featureRepository.createSuggested(
            {
              projectId,
              name: suggestedName,
              description: suggestedDescription,
            },
            tx,
          )
          await this.pullRequestRepository.updateAiFields(
            prId,
            {
              featureId: newFeature.id,
              aiConfidence: suggestionResult.confidence,
              aiRationale: suggestionResult.rationale,
            },
            tx,
          )
          return newFeature.id
        })
        suggestedByName.set(key, createPromise)
        await createPromise
        outcome = 'created-suggested'
      }
    }

    if (prSummaryResult && prSummaryResult.summary.trim().length > 0) {
      try {
        await this.db.$transaction((tx) =>
          this.pullRequestRepository.updateSummary(prId, prSummaryResult.summary, null, tx),
        )
      } catch (err: unknown) {
        hasSummaryFailure = true
        this.logger.warn(
          {
            event: LogEvent.AI_DRAFT_PR_PROCESSED,
            prId,
            summaryOutcome: 'store-failed',
            err: err instanceof Error ? err.message : String(err),
          },
          LogEvent.AI_DRAFT_PR_PROCESSED,
        )
      }
    }

    this.logger.info(
      {
        event: LogEvent.AI_DRAFT_PR_PROCESSED,
        prId,
        outcome,
        inputTokens: prUsage.inputTokens,
        outputTokens: prUsage.outputTokens,
        costUsd: prUsage.costUsd,
      },
      LogEvent.AI_DRAFT_PR_PROCESSED,
    )

    return { outcome, prUsage, hasSummaryFailure }
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
