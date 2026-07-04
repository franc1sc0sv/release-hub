import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IBlockedBranchRepository } from '../../interfaces/blocked-branch.repository'
import {
  BranchBlockReason,
  type IBranchCleanupPlan,
  type IBranchCleanupPlanDeletable,
  type IBranchCleanupPlanKept,
} from '../../interfaces/repo-ops.interfaces'
import { deriveBranchBlockReasons } from '../../utils/branch-block-reason.util'
import { fetchBranchCommitDetails } from '../../utils/fetch-branch-commit-details.util'
import { GetBranchCleanupPlanQuery } from './get-branch-cleanup-plan.query'

interface IResolvedBranchCleanupPlanSource {
  repo: string
  accessToken: string
  releaseRefs: string[]
  blockedNames: Set<string>
}

@QueryHandler(GetBranchCleanupPlanQuery)
export class GetBranchCleanupPlanHandler
  implements IQueryHandler<GetBranchCleanupPlanQuery, IBranchCleanupPlan>
{
  constructor(
    private readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {}

  async execute(query: GetBranchCleanupPlanQuery): Promise<IBranchCleanupPlan> {
    const { repo, accessToken, releaseRefs, blockedNames } = await this.resolveSource(query)

    const [branches, openHeads, defaultBranch] = await Promise.all([
      this.gitHubClient.listBranches(repo, accessToken),
      this.gitHubClient.listOpenPullRequestHeads(repo, accessToken),
      this.gitHubClient.getDefaultBranch(repo, accessToken),
    ])

    const openRefs = new Set(openHeads.map((head) => head.headRef))
    const referencedRefs = new Set(releaseRefs)

    const commitDetails = await fetchBranchCommitDetails(
      this.gitHubClient,
      repo,
      accessToken,
      branches.map((branch) => branch.name),
    )

    const deletable: IBranchCleanupPlanDeletable[] = []
    const kept: IBranchCleanupPlanKept[] = []

    for (const branch of branches) {
      const commitDetail = commitDetails.get(branch.name) ?? null
      const blockReasons = deriveBranchBlockReasons({
        branchName: branch.name,
        isDefault: branch.name === defaultBranch,
        githubProtected: branch.protected,
        hasOpenPr: openRefs.has(branch.name),
        lastCommitAt: commitDetail?.committedAt ?? null,
        manuallyBlocked: blockedNames.has(branch.name),
      })

      if (blockReasons.length > 0) {
        kept.push({ name: branch.name, blockReasons })
        continue
      }

      if (referencedRefs.has(branch.name)) {
        kept.push({ name: branch.name, blockReasons: [BranchBlockReason.RELEASE_REFERENCED] })
        continue
      }

      deletable.push({
        name: branch.name,
        lastCommitAt: commitDetail?.committedAt ?? null,
        lastCommitAuthorLogin: commitDetail?.authorLogin ?? null,
        lastCommitAuthorName: commitDetail?.authorName ?? null,
        lastCommitAuthorAvatarUrl: commitDetail?.authorAvatarUrl ?? null,
      })
    }

    deletable.sort((a, b) => a.name.localeCompare(b.name))
    kept.sort((a, b) => a.name.localeCompare(b.name))

    return { deletable, kept }
  }

  private async resolveSource(
    query: GetBranchCleanupPlanQuery,
  ): Promise<IResolvedBranchCleanupPlanSource> {
    return this.db.$query(async (tx) => {
      const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
      const ability = defineAbilityFor(memberships)

      if (
        !ability.can(Action.MANAGE, {
          kind: Subject.PROJECT,
          __type: Subject.PROJECT,
          projectId: query.projectId,
        })
      ) {
        throw new ForbiddenException()
      }

      const project = await this.projectRepository.findById(query.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const connection = await this.githubConnectionRepository.findByUserId(query.userId, tx)
      if (!connection) {
        throw new AppException(
          'GitHub is not connected. Please connect your GitHub account in settings.',
          ErrorCode.GITHUB_NOT_CONNECTED,
        )
      }

      const releases = await this.releaseRepository.findAllByProject(query.projectId, tx)
      const blockedBranches = await this.blockedBranchRepository.findAllByProject(query.projectId, tx)

      return {
        repo: project.repo,
        accessToken: decryptToken(connection.accessToken),
        releaseRefs: releases.flatMap((release) => [release.baseRef, release.compareRef]),
        blockedNames: new Set(blockedBranches.map((blocked) => blocked.branchName)),
      }
    })
  }
}
