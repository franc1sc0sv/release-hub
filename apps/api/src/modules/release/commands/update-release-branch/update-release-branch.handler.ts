import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { IReleaseRepository } from '../../interfaces/release.repository'
import {
  BranchUpdateAction,
  type IReleaseBranchSource,
  type IResolvedReleaseParent,
  type IUpdateReleaseBranchPreparation,
} from '../../interfaces/release-branch.interfaces'
import { UpdateReleaseBranchResultType } from '../../types/update-release-branch-result.type'
import { ReleaseBranchUpdatedEvent } from '../../events/release-branch-updated.event'
import { decideBranchUpdate } from '../../utils/decide-branch-update'
import { isWritableReleaseBranch } from '../../utils/is-writable-release-branch'
import { resolveReleaseParent } from '../../utils/resolve-release-parent'
import { UpdateReleaseBranchCommand } from './update-release-branch.command'

@CommandHandler(UpdateReleaseBranchCommand)
export class UpdateReleaseBranchHandler extends PreparedCommandHandler<
  UpdateReleaseBranchCommand,
  IUpdateReleaseBranchPreparation,
  UpdateReleaseBranchResultType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: UpdateReleaseBranchCommand): Promise<IUpdateReleaseBranchPreparation> {
    const source = await this.resolveSource(command)
    const parent = await resolveReleaseParent(this.gitHubClient, source)

    if (parent.sourceRef === null) {
      throw new AppException(
        'No parent branch could be found for this release. Select a parent branch first.',
        ErrorCode.VALIDATION_ERROR,
      )
    }

    const sourceRef = parent.sourceRef
    const action = decideBranchUpdate({
      method: source.updateMethod,
      behindBy: parent.behindBy,
      ownCommits: parent.ownCommits,
    })

    const base = {
      projectId: source.projectId,
      method: source.updateMethod,
      sourceRef,
      detected: parent.detected,
    }

    switch (action) {
      case BranchUpdateAction.NOTHING: {
        const headSha = await this.gitHubClient.getRefSha(source.repo, source.compareRef, source.accessToken)
        return { ...base, commitsAdded: 0, headSha }
      }
      case BranchUpdateAction.REFUSE:
        throw new AppException(
          this.refusalMessage(source.compareRef, sourceRef, parent),
          ErrorCode.CONFLICT,
        )
      case BranchUpdateAction.FAST_FORWARD: {
        await this.assertWritableReleaseBranch(source)
        const headSha = await this.gitHubClient.getRefSha(source.repo, sourceRef, source.accessToken)
        await this.gitHubClient.fastForwardBranch(source.repo, source.compareRef, headSha, source.accessToken)
        return { ...base, commitsAdded: parent.behindBy, headSha }
      }
      case BranchUpdateAction.MERGE: {
        await this.assertWritableReleaseBranch(source)
        const merge = await this.gitHubClient.mergeBranch(
          source.repo,
          source.compareRef,
          sourceRef,
          `Merge ${sourceRef} into ${source.compareRef}`,
          source.accessToken,
        )
        const headSha =
          merge.sha ?? (await this.gitHubClient.getRefSha(source.repo, source.compareRef, source.accessToken))
        return { ...base, commitsAdded: merge.merged ? parent.behindBy : 0, headSha }
      }
    }
  }

  protected async handle(
    command: UpdateReleaseBranchCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: IUpdateReleaseBranchPreparation,
  ): Promise<UpdateReleaseBranchResultType> {
    if (prepared.detected) {
      await this.releaseRepository.setSourceRef(command.releaseId, prepared.sourceRef, tx)
    }

    if (prepared.commitsAdded > 0) {
      events.push(
        new ReleaseBranchUpdatedEvent(
          command.releaseId,
          prepared.projectId,
          prepared.sourceRef,
          prepared.method,
          prepared.commitsAdded,
          command.userId,
        ),
      )
    }

    const result = new UpdateReleaseBranchResultType()
    result.method = prepared.method
    result.sourceRef = prepared.sourceRef
    result.commitsAdded = prepared.commitsAdded
    result.headSha = prepared.headSha
    return result
  }

  private async assertWritableReleaseBranch(source: IReleaseBranchSource): Promise<void> {
    const [repoDefaultBranch, isProtected] = await Promise.all([
      this.gitHubClient.getDefaultBranch(source.repo, source.accessToken),
      this.gitHubClient.isBranchProtected(source.repo, source.compareRef, source.accessToken),
    ])

    const writable = isWritableReleaseBranch({
      compareRef: source.compareRef,
      baseRef: source.baseRef,
      repoDefaultBranch,
      defaultParentBranch: source.defaultParentBranch,
      isProtected,
    })

    if (!writable) {
      throw new AppException(
        `${source.compareRef} is a protected, default, base, or parent branch, so Release Hub will not write to it. Update it in GitHub or a terminal.`,
        ErrorCode.FORBIDDEN,
      )
    }
  }

  private refusalMessage(compareRef: string, sourceRef: string, parent: IResolvedReleaseParent): string {
    return `${compareRef} has ${parent.ownCommits} own commit(s) that are not in ${sourceRef}, so it cannot be fast-forwarded. Rebase ${compareRef} onto ${sourceRef} in a terminal.`
  }

  private async resolveSource(command: UpdateReleaseBranchCommand): Promise<IReleaseBranchSource> {
    return this.db.$transaction(async (tx) => {
      const release = await this.releaseRepository.findById(command.releaseId, tx)
      if (!release) throw new NotFoundException('Release')

      await authorizeProjectAction(
        this.organizationRepository,
        {
          actorId: command.userId,
          projectId: release.projectId,
          action: Action.UPDATE,
          subjectKind: Subject.RELEASE,
        },
        tx,
      )

      if (
        release.status === ReleaseStatus.MERGED ||
        release.status === ReleaseStatus.DEPLOYED ||
        release.status === ReleaseStatus.CANCELED
      ) {
        throw new AppException(
          'The release branch cannot be updated once a release is merged, deployed, or canceled',
          ErrorCode.VALIDATION_ERROR,
        )
      }

      const project = await this.projectRepository.findById(release.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const accessToken = await this.tokenResolver.resolveForProject(release.projectId, command.userId, tx)

      return {
        projectId: release.projectId,
        repo: project.repo,
        accessToken,
        baseRef: release.baseRef,
        compareRef: release.compareRef,
        storedSourceRef: release.sourceRef,
        defaultParentBranch: project.defaultParentBranch,
        updateMethod: project.branchUpdateMethod,
      }
    })
  }
}
