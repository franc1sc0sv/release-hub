import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { IGitHubClient, type IGitHubBranch } from '../../../integration/interfaces/github-client.interface'
import { IBlockedBranchRepository } from '../../interfaces/blocked-branch.repository'
import type { IBranchCleanupCandidate } from '../../interfaces/repo-ops.interfaces'
import { GetBranchCleanupCandidatesQuery } from './get-branch-cleanup-candidates.query'

const STALE_AFTER_DAYS = 30

@QueryHandler(GetBranchCleanupCandidatesQuery)
export class GetBranchCleanupCandidatesHandler extends BaseQueryHandler<
  GetBranchCleanupCandidatesQuery,
  IBranchCleanupCandidate[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetBranchCleanupCandidatesQuery,
    tx: TxClient,
  ): Promise<IBranchCleanupCandidate[]> {
    const memberships = await this.projectRepository.findMembershipsForUser(query.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.READ, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: query.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.resolveAccessToken(query.userId, tx)

    const [branches, mergedHeads, openHeads, releases, blockedBranches, defaultBranch] =
      await Promise.all([
        this.gitHubClient.listBranches(project.repo, accessToken),
        this.gitHubClient.listMergedPullRequestHeads(project.repo, accessToken),
        this.gitHubClient.listOpenPullRequestHeads(project.repo, accessToken),
        this.releaseRepository.findAllByProject(query.projectId, tx),
        this.blockedBranchRepository.findAllByProject(query.projectId, tx),
        this.gitHubClient.getDefaultBranch(project.repo, accessToken),
      ])

    const mergedRefs = new Set(mergedHeads.map((head) => head.headRef))
    const openRefs = new Set(openHeads.map((head) => head.headRef))
    const referencedRefs = new Set(releases.flatMap((release) => [release.baseRef, release.compareRef]))
    const blockedRefs = new Set(blockedBranches.map((blocked) => blocked.branchName))

    return branches.map((branch) => this.toCandidate(branch, {
      mergedRefs,
      openRefs,
      referencedRefs,
      blockedRefs,
      defaultBranch,
    }))
  }

  private toCandidate(
    branch: IGitHubBranch,
    context: {
      mergedRefs: Set<string>
      openRefs: Set<string>
      referencedRefs: Set<string>
      blockedRefs: Set<string>
      defaultBranch: string
    },
  ): IBranchCleanupCandidate {
    const lastCommitDate = this.resolveLastCommitDate()

    const mergedViaPr = context.mergedRefs.has(branch.name)
    const noOpenPr = !context.openRefs.has(branch.name)
    const unreferencedByReleases = !context.referencedRefs.has(branch.name)
    const blocked = context.blockedRefs.has(branch.name)
    const isDefault = branch.name === context.defaultBranch
    const stale = this.isStale(lastCommitDate)

    const suggested =
      mergedViaPr &&
      noOpenPr &&
      unreferencedByReleases &&
      !blocked &&
      !isDefault &&
      !branch.protected

    return {
      name: branch.name,
      lastCommitDate,
      protected: branch.protected,
      signals: {
        mergedViaPr,
        stale,
        unreferencedByReleases,
        noOpenPr,
        blocked,
        isDefault,
      },
      suggested,
    }
  }

  private resolveLastCommitDate(): Date | null {
    return null
  }

  private isStale(lastCommitDate: Date | null): boolean {
    if (lastCommitDate === null) return false
    return Date.now() - lastCommitDate.getTime() > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000
  }

  private async resolveAccessToken(userId: string, tx: TxClient): Promise<string> {
    const connection = await this.githubConnectionRepository.findByUserId(userId, tx)
    if (!connection) {
      throw new AppException(
        'GitHub is not connected. Please connect your GitHub account in settings.',
        ErrorCode.GITHUB_NOT_CONNECTED,
      )
    }
    return decryptToken(connection.accessToken)
  }
}
