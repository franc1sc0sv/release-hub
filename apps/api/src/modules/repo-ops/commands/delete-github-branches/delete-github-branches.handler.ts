import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IBlockedBranchRepository } from '../../interfaces/blocked-branch.repository'
import { BranchBlockReason, type IDeleteBranchOutcome } from '../../interfaces/repo-ops.interfaces'
import { deriveBranchBlockReasons } from '../../utils/branch-block-reason.util'
import { fetchBranchCommitDetails } from '../../utils/fetch-branch-commit-details.util'
import { DeleteGithubBranchesCommand } from './delete-github-branches.command'

interface IResolvedDeleteBranchesSource {
  repo: string
  accessToken: string
  blockedNames: Set<string>
}

@CommandHandler(DeleteGithubBranchesCommand)
export class DeleteGithubBranchesHandler extends PreparedCommandHandler<
  DeleteGithubBranchesCommand,
  IDeleteBranchOutcome[],
  IDeleteBranchOutcome[]
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(
    command: DeleteGithubBranchesCommand,
  ): Promise<IDeleteBranchOutcome[]> {
    const { repo, accessToken, blockedNames } = await this.resolveSource(command)

    const [branches, openHeads, defaultBranch] = await Promise.all([
      this.gitHubClient.listBranches(repo, accessToken),
      this.gitHubClient.listOpenPullRequestHeads(repo, accessToken),
      this.gitHubClient.getDefaultBranch(repo, accessToken),
    ])

    const branchByName = new Map(branches.map((branch) => [branch.name, branch]))
    const openRefs = new Set(openHeads.map((head) => head.headRef))
    const overriddenNames = new Set(command.overriddenBranchNames)

    const commitDetails = await fetchBranchCommitDetails(
      this.gitHubClient,
      repo,
      accessToken,
      command.branchNames,
    )

    const outcomes: IDeleteBranchOutcome[] = []

    for (const branchName of command.branchNames) {
      const branch = branchByName.get(branchName)
      if (!branch) {
        outcomes.push({ branchName, deleted: false, reason: 'Branch not found' })
        continue
      }

      const commitDetail = commitDetails.get(branchName) ?? null
      const blockReasons = deriveBranchBlockReasons({
        branchName,
        isDefault: branchName === defaultBranch,
        githubProtected: branch.protected,
        hasOpenPr: openRefs.has(branchName),
        lastCommitAt: commitDetail?.committedAt ?? null,
        manuallyBlocked: blockedNames.has(branchName),
      })

      const refusal = this.resolveRefusal(blockReasons, overriddenNames.has(branchName))
      if (refusal) {
        outcomes.push({ branchName, deleted: false, reason: refusal })
        continue
      }

      const result = await this.gitHubClient.deleteBranch(repo, branchName, accessToken)
      outcomes.push({
        branchName,
        deleted: result.deleted,
        reason: result.deleted ? null : (result.reason ?? 'Unknown error'),
      })
    }

    return outcomes
  }

  protected async handle(
    _command: DeleteGithubBranchesCommand,
    _tx: TxClient,
    _events: IDomainEvent[],
    prepared: IDeleteBranchOutcome[],
  ): Promise<IDeleteBranchOutcome[]> {
    return prepared
  }

  private resolveRefusal(blockReasons: BranchBlockReason[], overridden: boolean): string | null {
    if (blockReasons.includes(BranchBlockReason.DEFAULT_BRANCH)) return 'Branch is the default branch'
    if (blockReasons.includes(BranchBlockReason.GITHUB_PROTECTED)) return 'Branch is protected on GitHub'
    if (blockReasons.includes(BranchBlockReason.OPEN_PULL_REQUEST)) return 'Branch has an open pull request'
    if (blockReasons.includes(BranchBlockReason.MANUALLY_BLOCKED)) return 'Branch is manually blocked'
    if (!overridden && blockReasons.includes(BranchBlockReason.RECENT_ACTIVITY)) {
      return 'Branch has recent activity (commit within the last 30 days)'
    }
    if (!overridden && blockReasons.includes(BranchBlockReason.PROTECTED_NAME)) {
      return 'Branch name is a protected branch name'
    }
    return null
  }

  private async resolveSource(
    command: DeleteGithubBranchesCommand,
  ): Promise<IResolvedDeleteBranchesSource> {
    return this.db.$transaction(async (tx) => {
      const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
      const ability = defineAbilityFor(memberships)

      if (
        !ability.can(Action.MANAGE, {
          kind: Subject.PROJECT,
          __type: Subject.PROJECT,
          projectId: command.projectId,
        })
      ) {
        throw new ForbiddenException()
      }

      const project = await this.projectRepository.findById(command.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const accessToken = await this.resolveGitHubToken(command.userId, tx)
      const blockedBranches = await this.blockedBranchRepository.findAllByProject(command.projectId, tx)

      return {
        repo: project.repo,
        accessToken,
        blockedNames: new Set(blockedBranches.map((blocked) => blocked.branchName)),
      }
    })
  }

  private async resolveGitHubToken(userId: string, tx: TxClient): Promise<string> {
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
