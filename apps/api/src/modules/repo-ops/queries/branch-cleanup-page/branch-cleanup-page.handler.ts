import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import { Action, Subject } from '@release-hub/shared'
import { SortDirection } from '../../../../common/types/sort-direction.enum'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IBlockedBranchRepository } from '../../interfaces/blocked-branch.repository'
import {
  IGitHubClient,
  type IGitHubBranch,
  type IGitHubBranchCommitDetail,
} from '../../../integration/interfaces/github-client.interface'
import {
  BranchActivityRange,
  BranchCleanupSortField,
  BranchProtectionFilter,
  BranchSignalFilter,
  type BranchBlockReason,
  type IBranchCleanupPage,
  type IBranchCleanupPageItem,
} from '../../interfaces/repo-ops.interfaces'
import {
  deriveBranchBlockReasons,
  isBranchDeletable,
  isBranchOverridable,
} from '../../utils/branch-block-reason.util'
import { fetchBranchCommitDetails } from '../../utils/fetch-branch-commit-details.util'
import { BranchCleanupPageQuery } from './branch-cleanup-page.query'

const DAY_MS = 86_400_000
const OVER_RANGE_THRESHOLD_DAYS = 180
const ACTIVITY_RANGE_MAX_DAYS: Record<BranchActivityRange, number | null> = {
  [BranchActivityRange.LAST_WEEK]: 7,
  [BranchActivityRange.LAST_MONTH]: 30,
  [BranchActivityRange.LAST_3_MONTHS]: 90,
  [BranchActivityRange.LAST_6_MONTHS]: 180,
  [BranchActivityRange.OVER_6_MONTHS]: null,
}

interface IResolvedBranchCleanupPageSource {
  repo: string
  accessToken: string
  releaseRefs: string[]
  blockedNames: Set<string>
}

interface IBranchCleanupPageContext {
  repo: string
  mergedRefs: Set<string>
  openHeadNumbers: Map<string, number>
  referencedRefs: Set<string>
  defaultBranch: string
  blockedNames: Set<string>
}

@QueryHandler(BranchCleanupPageQuery)
export class BranchCleanupPageHandler implements IQueryHandler<BranchCleanupPageQuery, IBranchCleanupPage> {
  constructor(
    private readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(query: BranchCleanupPageQuery): Promise<IBranchCleanupPage> {
    const { repo, accessToken, releaseRefs, blockedNames } = await this.resolveSource(query)

    const [branches, mergedHeads, openHeads, defaultBranch] = await Promise.all([
      this.gitHubClient.listBranches(repo, accessToken),
      this.gitHubClient.listMergedPullRequestHeads(repo, accessToken),
      this.gitHubClient.listOpenPullRequestHeads(repo, accessToken),
      this.gitHubClient.getDefaultBranch(repo, accessToken),
    ])

    const context: IBranchCleanupPageContext = {
      repo,
      mergedRefs: new Set(mergedHeads.map((head) => head.headRef)),
      openHeadNumbers: new Map(openHeads.map((head) => [head.headRef, head.prNumber])),
      referencedRefs: new Set(releaseRefs),
      defaultBranch,
      blockedNames,
    }

    const needle = query.search?.trim().toLowerCase() ?? null
    let filtered = needle
      ? branches.filter((branch) => branch.name.toLowerCase().includes(needle))
      : branches

    if (query.signals.length > 0) {
      filtered = filtered.filter((branch) => this.matchesSignalFilters(branch, query.signals, context))
    }

    const needsAllCommitDetails =
      query.authorFilter !== null ||
      query.activity !== null ||
      query.protection !== null ||
      query.sortField === BranchCleanupSortField.LAST_ACTIVITY ||
      query.sortField === BranchCleanupSortField.AUTHOR ||
      query.sortField === BranchCleanupSortField.PROTECTED

    let page: IGitHubBranch[]
    let commitDetails: Map<string, IGitHubBranchCommitDetail | null>

    if (needsAllCommitDetails) {
      commitDetails = await fetchBranchCommitDetails(
        this.gitHubClient,
        repo,
        accessToken,
        filtered.map((branch) => branch.name),
      )
      filtered = this.applyCommitDetailFilters(filtered, commitDetails, query, context)
      page = this.sortWithDetails(filtered, commitDetails, query, context).slice(
        query.offset,
        query.offset + query.limit,
      )
    } else {
      const ordered = query.sortField
        ? this.sortBySignal(filtered, query.sortField, query.sortDirection, context)
        : filtered
      page = ordered.slice(query.offset, query.offset + query.limit)
      commitDetails = await fetchBranchCommitDetails(
        this.gitHubClient,
        repo,
        accessToken,
        page.map((branch) => branch.name),
      )
    }

    const items = page.map((branch) => this.toItem(branch, commitDetails.get(branch.name) ?? null, context))

    return { items, totalCount: filtered.length }
  }

  private matchesSignalFilters(
    branch: IGitHubBranch,
    signals: BranchSignalFilter[],
    context: IBranchCleanupPageContext,
  ): boolean {
    return signals.every((signal) => {
      if (signal === BranchSignalFilter.MERGED_VIA_PR) return context.mergedRefs.has(branch.name)
      if (signal === BranchSignalFilter.OPEN_PR) return context.openHeadNumbers.has(branch.name)
      return !context.referencedRefs.has(branch.name)
    })
  }

  private matchesActivityRange(committedAt: Date | null, range: BranchActivityRange): boolean {
    if (!committedAt) return false
    const ageDays = (Date.now() - committedAt.getTime()) / DAY_MS
    const maxDays = ACTIVITY_RANGE_MAX_DAYS[range]
    return maxDays === null ? ageDays > OVER_RANGE_THRESHOLD_DAYS : ageDays <= maxDays
  }

  private blockReasonsFor(
    branch: IGitHubBranch,
    commitDetail: IGitHubBranchCommitDetail | null,
    context: IBranchCleanupPageContext,
  ): BranchBlockReason[] {
    return deriveBranchBlockReasons({
      branchName: branch.name,
      isDefault: branch.name === context.defaultBranch,
      githubProtected: branch.protected,
      hasOpenPr: context.openHeadNumbers.has(branch.name),
      lastCommitAt: commitDetail?.committedAt ?? null,
      manuallyBlocked: context.blockedNames.has(branch.name),
    })
  }

  private applyCommitDetailFilters(
    branches: IGitHubBranch[],
    details: Map<string, IGitHubBranchCommitDetail | null>,
    query: BranchCleanupPageQuery,
    context: IBranchCleanupPageContext,
  ): IGitHubBranch[] {
    const authorNeedle = query.authorFilter?.trim().toLowerCase() || null
    return branches.filter((branch) => {
      const detail = details.get(branch.name) ?? null
      if (authorNeedle) {
        const login = detail?.authorLogin?.toLowerCase() ?? null
        const name = detail?.authorName?.toLowerCase() ?? null
        if (login !== authorNeedle && name !== authorNeedle) return false
      }
      if (query.activity && !this.matchesActivityRange(detail?.committedAt ?? null, query.activity)) {
        return false
      }
      if (query.protection) {
        const isProtected = this.blockReasonsFor(branch, detail, context).length > 0
        if (query.protection === BranchProtectionFilter.PROTECTED && !isProtected) return false
        if (query.protection === BranchProtectionFilter.UNPROTECTED && isProtected) return false
      }
      return true
    })
  }

  private sortWithDetails(
    branches: IGitHubBranch[],
    details: Map<string, IGitHubBranchCommitDetail | null>,
    query: BranchCleanupPageQuery,
    context: IBranchCleanupPageContext,
  ): IGitHubBranch[] {
    if (
      query.sortField === BranchCleanupSortField.LAST_ACTIVITY ||
      query.sortField === BranchCleanupSortField.AUTHOR
    ) {
      return this.sortByCommitDetail(branches, details, query)
    }
    if (query.sortField === BranchCleanupSortField.PROTECTED) {
      return this.sortByProtection(branches, details, query.sortDirection, context)
    }
    if (query.sortField) {
      return this.sortBySignal(branches, query.sortField, query.sortDirection, context)
    }
    return branches
  }

  private sortByProtection(
    branches: IGitHubBranch[],
    details: Map<string, IGitHubBranchCommitDetail | null>,
    direction: SortDirection,
    context: IBranchCleanupPageContext,
  ): IGitHubBranch[] {
    const protectedFirst = direction === SortDirection.DESC ? -1 : 1
    return [...branches].sort((a, b) => {
      const aProtected = this.blockReasonsFor(a, details.get(a.name) ?? null, context).length > 0
      const bProtected = this.blockReasonsFor(b, details.get(b.name) ?? null, context).length > 0
      if (aProtected === bProtected) return a.name.localeCompare(b.name)
      return aProtected ? protectedFirst : -protectedFirst
    })
  }

  private sortByCommitDetail(
    branches: IGitHubBranch[],
    details: Map<string, IGitHubBranchCommitDetail | null>,
    query: BranchCleanupPageQuery,
  ): IGitHubBranch[] {
    const direction = query.sortDirection === SortDirection.ASC ? 1 : -1
    const sortKey = (branch: IGitHubBranch): string | number | null => {
      const detail = details.get(branch.name) ?? null
      if (!detail) return null
      if (query.sortField === BranchCleanupSortField.AUTHOR) {
        const author = detail.authorLogin ?? detail.authorName
        return author ? author.toLowerCase() : null
      }
      return detail.committedAt.getTime()
    }
    return [...branches].sort((a, b) => {
      const keyA = sortKey(a)
      const keyB = sortKey(b)
      if (keyA === null && keyB === null) return a.name.localeCompare(b.name)
      if (keyA === null) return 1
      if (keyB === null) return -1
      if (keyA === keyB) return a.name.localeCompare(b.name)
      return (keyA < keyB ? -1 : 1) * direction
    })
  }

  private sortBySignal(
    branches: IGitHubBranch[],
    field: BranchCleanupSortField,
    direction: SortDirection,
    context: IBranchCleanupPageContext,
  ): IGitHubBranch[] {
    const hasFirst = direction === SortDirection.DESC ? -1 : 1
    const hasSignal = (branch: IGitHubBranch): boolean => {
      if (field === BranchCleanupSortField.MERGED_VIA_PR) return context.mergedRefs.has(branch.name)
      if (field === BranchCleanupSortField.OPEN_PR) return context.openHeadNumbers.has(branch.name)
      return !context.referencedRefs.has(branch.name)
    }
    return [...branches].sort((a, b) => {
      const hasA = hasSignal(a)
      const hasB = hasSignal(b)
      if (hasA === hasB) return a.name.localeCompare(b.name)
      return hasA ? hasFirst : -hasFirst
    })
  }

  private toItem(
    branch: IGitHubBranch,
    commitDetail: IGitHubBranchCommitDetail | null,
    context: IBranchCleanupPageContext,
  ): IBranchCleanupPageItem {
    const isDefault = branch.name === context.defaultBranch
    const lastCommitAt = commitDetail?.committedAt ?? null
    const openPullRequestNumber = context.openHeadNumbers.get(branch.name) ?? null

    const blockReasons = this.blockReasonsFor(branch, commitDetail, context)

    return {
      name: branch.name,
      isDefault,
      githubProtected: branch.protected,
      lastCommitAt,
      lastCommitAuthorLogin: commitDetail?.authorLogin ?? null,
      lastCommitAuthorName: commitDetail?.authorName ?? null,
      lastCommitAuthorAvatarUrl: commitDetail?.authorAvatarUrl ?? null,
      openPullRequestNumber,
      openPullRequestUrl:
        openPullRequestNumber === null
          ? null
          : `https://github.com/${context.repo}/pull/${openPullRequestNumber}`,
      signals: {
        mergedViaPr: context.mergedRefs.has(branch.name),
        noOpenPr: openPullRequestNumber === null,
        unreferencedByReleases: !context.referencedRefs.has(branch.name),
      },
      blockReasons,
      deletable: isBranchDeletable(blockReasons),
      overridable: isBranchOverridable(blockReasons),
    }
  }

  private async resolveSource(query: BranchCleanupPageQuery): Promise<IResolvedBranchCleanupPageSource> {
    return this.db.$transaction(async (tx) => {
      await authorizeProjectAction(
        this.organizationRepository,
        {
          actorId: query.userId,
          projectId: query.projectId,
          action: Action.READ,
          subjectKind: Subject.PROJECT,
        },
        tx,
      )

      const project = await this.projectRepository.findById(query.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const accessToken = await this.tokenResolver.resolveForProject(query.projectId, query.userId, tx)
      const releases = await this.releaseRepository.findAllByProject(query.projectId, tx)
      const blockedBranches = await this.blockedBranchRepository.findAllByProject(query.projectId, tx)

      return {
        repo: project.repo,
        accessToken,
        releaseRefs: releases.flatMap((release) => [release.baseRef, release.compareRef]),
        blockedNames: new Set(blockedBranches.map((blocked) => blocked.branchName)),
      }
    })
  }
}
