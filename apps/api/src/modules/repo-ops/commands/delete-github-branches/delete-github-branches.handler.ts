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
import { IReleaseRepository } from '../../../release/interfaces/release.repository'
import { IGithubConnectionRepository } from '../../../github-auth/interfaces/github-connection.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IBlockedBranchRepository } from '../../interfaces/blocked-branch.repository'
import type { IDeleteBranchOutcome } from '../../interfaces/repo-ops.interfaces'
import { DeleteGithubBranchesCommand } from './delete-github-branches.command'

interface IResolvedDeleteBranchesSource {
  repo: string
  accessToken: string
  releaseRefs: string[]
  blockedBranchNames: string[]
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
    private readonly releaseRepository: IReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(
    command: DeleteGithubBranchesCommand,
  ): Promise<IDeleteBranchOutcome[]> {
    const { repo, accessToken, releaseRefs, blockedBranchNames } = await this.resolveSource(command)

    const [branches, mergedHeads, openHeads, defaultBranch] = await Promise.all([
      this.gitHubClient.listBranches(repo, accessToken),
      this.gitHubClient.listMergedPullRequestHeads(repo, accessToken),
      this.gitHubClient.listOpenPullRequestHeads(repo, accessToken),
      this.gitHubClient.getDefaultBranch(repo, accessToken),
    ])

    const branchByName = new Map(branches.map((branch) => [branch.name, branch]))
    const mergedRefs = new Set(mergedHeads.map((head) => head.headRef))
    const openRefs = new Set(openHeads.map((head) => head.headRef))
    const referencedRefs = new Set(releaseRefs)
    const blockedRefs = new Set(blockedBranchNames)

    const outcomes: IDeleteBranchOutcome[] = []

    for (const branchName of command.branchNames) {
      const branch = branchByName.get(branchName)
      if (!branch) {
        outcomes.push({ branchName, deleted: false, reason: 'Branch not found' })
        continue
      }

      const mergedViaPr = mergedRefs.has(branchName)
      const noOpenPr = !openRefs.has(branchName)
      const unreferencedByReleases = !referencedRefs.has(branchName)
      const blocked = blockedRefs.has(branchName)
      const isDefault = branchName === defaultBranch

      const safeToDelete =
        mergedViaPr && noOpenPr && unreferencedByReleases && !blocked && !isDefault && !branch.protected

      if (!safeToDelete) {
        outcomes.push({
          branchName,
          deleted: false,
          reason: this.buildRefusalReason({
            mergedViaPr,
            noOpenPr,
            unreferencedByReleases,
            blocked,
            isDefault,
            protectedBranch: branch.protected,
          }),
        })
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

  private buildRefusalReason(flags: {
    mergedViaPr: boolean
    noOpenPr: boolean
    unreferencedByReleases: boolean
    blocked: boolean
    isDefault: boolean
    protectedBranch: boolean
  }): string {
    if (flags.isDefault) return 'Branch is the default branch'
    if (flags.blocked) return 'Branch is blocked from cleanup'
    if (flags.protectedBranch) return 'Branch is protected on GitHub'
    if (!flags.mergedViaPr) return 'Branch has no merged pull request'
    if (!flags.noOpenPr) return 'Branch has an open pull request'
    if (!flags.unreferencedByReleases) return 'Branch is referenced by a release'
    return 'Branch failed the cleanup safety check'
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

      const releases = await this.releaseRepository.findAllByProject(command.projectId, tx)
      const blockedBranches = await this.blockedBranchRepository.findAllByProject(command.projectId, tx)

      return {
        repo: project.repo,
        accessToken,
        releaseRefs: releases.flatMap((release) => [release.baseRef, release.compareRef]),
        blockedBranchNames: blockedBranches.map((blocked) => blocked.branchName),
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
