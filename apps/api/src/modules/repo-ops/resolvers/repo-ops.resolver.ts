import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { PoliciesGuard } from '../../../common/guards/policies.guard'
import { Can } from '../../../common/decorators/check-policies.decorator'
import { CurrentUser } from '../../../common/decorators/current-user.decorator'
import type { IJwtUser } from '../../../common/types'
import { Action, Subject } from '@release-hub/shared'
import type { IBlockedBranch } from '../interfaces/blocked-branch.repository'
import type { IBranchCleanupCandidate, IDeleteBranchOutcome } from '../interfaces/repo-ops.interfaces'
import { BlockedBranchType } from '../types/blocked-branch.type'
import { BranchCleanupCandidateType } from '../types/branch-cleanup-candidate.type'
import { DeleteBranchOutcomeType } from '../types/delete-branch-outcome.type'
import { BlockBranchInput } from '../types/block-branch.input'
import { UnblockBranchInput } from '../types/unblock-branch.input'
import { DeleteGithubBranchesInput } from '../types/delete-github-branches.input'
import {
  toBlockedBranchType,
  toBranchCleanupCandidateType,
  toDeleteBranchOutcomeType,
} from '../types/repo-ops.mappers'
import { BlockBranchCommand } from '../commands/block-branch/block-branch.command'
import { UnblockBranchCommand } from '../commands/unblock-branch/unblock-branch.command'
import { DeleteGithubBranchesCommand } from '../commands/delete-github-branches/delete-github-branches.command'
import { ListBlockedBranchesQuery } from '../queries/list-blocked-branches/list-blocked-branches.query'
import { GetBranchCleanupCandidatesQuery } from '../queries/get-branch-cleanup-candidates/get-branch-cleanup-candidates.query'

@Resolver()
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class RepoOpsResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => [BlockedBranchType])
  @Can(Action.READ, Subject.PROJECT)
  async blockedBranches(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<BlockedBranchType[]> {
    const blockedBranches: IBlockedBranch[] = await this.queryBus.execute(
      new ListBlockedBranchesQuery(user.id, projectId),
    )
    return blockedBranches.map(toBlockedBranchType)
  }

  @Query(() => [BranchCleanupCandidateType])
  @Can(Action.READ, Subject.PROJECT)
  async branchCleanupCandidates(
    @Args('projectId', { type: () => ID }) projectId: string,
    @CurrentUser() user: IJwtUser,
  ): Promise<BranchCleanupCandidateType[]> {
    const candidates: IBranchCleanupCandidate[] = await this.queryBus.execute(
      new GetBranchCleanupCandidatesQuery(user.id, projectId),
    )
    return candidates.map(toBranchCleanupCandidateType)
  }

  @Mutation(() => BlockedBranchType)
  @Can(Action.UPDATE, Subject.PROJECT)
  async blockBranch(
    @Args('input', { type: () => BlockBranchInput }) input: BlockBranchInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<BlockedBranchType> {
    const blockedBranch: IBlockedBranch = await this.commandBus.execute(
      new BlockBranchCommand(user.id, input.projectId, input.branchName, input.reason ?? null),
    )
    return toBlockedBranchType(blockedBranch)
  }

  @Mutation(() => Boolean)
  @Can(Action.UPDATE, Subject.PROJECT)
  async unblockBranch(
    @Args('input', { type: () => UnblockBranchInput }) input: UnblockBranchInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<boolean> {
    return this.commandBus.execute(new UnblockBranchCommand(user.id, input.projectId, input.branchName))
  }

  @Mutation(() => [DeleteBranchOutcomeType])
  @Can(Action.MANAGE, Subject.PROJECT)
  async deleteGithubBranches(
    @Args('input', { type: () => DeleteGithubBranchesInput }) input: DeleteGithubBranchesInput,
    @CurrentUser() user: IJwtUser,
  ): Promise<DeleteBranchOutcomeType[]> {
    const outcomes: IDeleteBranchOutcome[] = await this.commandBus.execute(
      new DeleteGithubBranchesCommand(user.id, input.projectId, input.branchNames),
    )
    return outcomes.map(toDeleteBranchOutcomeType)
  }
}
