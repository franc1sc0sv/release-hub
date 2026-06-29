import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { FeatureState } from '../../../common/types/feature-state.enum'
import { IAiRepository } from '../interfaces/ai.repository'
import type {
  IAiPullRequestContext,
  IAiFeatureContext,
  IAiReleaseContext,
} from '../interfaces/ai.repository'

@Injectable()
export class AiRepository extends IAiRepository {
  findPullRequestContext = async (
    prId: string,
    tx: TxClient,
  ): Promise<IAiPullRequestContext | null> => {
    const pr = await tx.pullRequest.findFirst({
      where: { id: prId },
      include: {
        commits: { select: { message: true } },
        ticketLinks: { select: { title: true, description: true }, take: 5 },
        release: { select: { projectId: true } },
      },
    })

    if (!pr) return null

    return {
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      author: pr.author,
      branchName: '',
      changedPaths: [],
      commitMessages: pr.commits.map((c) => c.message),
      linkedTicketTitle: pr.ticketLinks[0]?.title ?? null,
      tickets: pr.ticketLinks.map((t) => ({ title: t.title, description: t.description })),
      releaseId: pr.releaseId,
      projectId: pr.release.projectId,
    }
  }

  findFeaturesForProject = async (
    projectId: string,
    tx: TxClient,
  ): Promise<IAiFeatureContext[]> => {
    const features = await tx.feature.findMany({
      where: { projectId, deletedAt: null },
      include: {
        featureInReleases: {
          where: { release: { deletedAt: null } },
          orderBy: { updatedAt: 'desc' },
          take: 1,
          select: { state: true, flagStaging: true, flagProduction: true },
        },
      },
    })

    return features.map((f) => {
      const latest = f.featureInReleases[0]

      return {
        id: f.id,
        name: f.name,
        description: f.description,
        kind: f.kind,
        state: latest?.state ?? FeatureState.IN_PROGRESS,
        flagStaging: latest?.flagStaging ?? null,
        flagProduction: latest?.flagProduction ?? null,
        tags: f.tags,
        prSummaries: [],
      }
    })
  }

  findReleaseContext = async (
    releaseId: string,
    tx: TxClient,
    featureIds?: string[],
  ): Promise<IAiReleaseContext | null> => {
    const release = await tx.release.findFirst({
      where: { id: releaseId, deletedAt: null },
      select: { id: true, name: true, compareRef: true, projectId: true },
    })

    if (!release) return null

    const assignedPrs = await tx.pullRequest.findMany({
      where: { releaseId, featureId: { not: null } },
      select: {
        summary: true,
        feature: {
          select: {
            id: true,
            name: true,
            description: true,
            kind: true,
            tags: true,
          },
        },
        featureId: true,
      },
    })

    const ledgerEntries = await tx.featureInRelease.findMany({
      where: { releaseId },
      select: {
        featureId: true,
        state: true,
        flagStaging: true,
        flagProduction: true,
      },
    })
    const ledgerByFeatureId = new Map(
      ledgerEntries.map((entry) => [entry.featureId, entry]),
    )

    const featureSummaries = new Map<string, string[]>()
    for (const pr of assignedPrs) {
      if (!pr.featureId) continue
      const existing = featureSummaries.get(pr.featureId) ?? []
      if (pr.summary && pr.summary.trim().length > 0) {
        existing.push(pr.summary.trim())
      }
      featureSummaries.set(pr.featureId, existing)
    }

    const features: IAiFeatureContext[] = []
    const seen = new Set<string>()
    for (const pr of assignedPrs) {
      const feature = pr.feature
      if (!feature || seen.has(feature.id)) continue
      if (featureIds && featureIds.length > 0 && !featureIds.includes(feature.id)) continue
      seen.add(feature.id)
      const ledger = ledgerByFeatureId.get(feature.id)
      features.push({
        id: feature.id,
        name: feature.name,
        description: feature.description,
        kind: feature.kind,
        state: ledger?.state ?? FeatureState.IN_PROGRESS,
        flagStaging: ledger?.flagStaging ?? null,
        flagProduction: ledger?.flagProduction ?? null,
        tags: feature.tags,
        prSummaries: featureSummaries.get(feature.id) ?? [],
      })
    }

    return {
      id: release.id,
      name: release.name ?? '',
      compareRef: release.compareRef,
      projectId: release.projectId,
      features,
    }
  }
}
