import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException, ConflictException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IBlockedBranchRepository, type IBlockedBranch } from '../../interfaces/blocked-branch.repository'
import { BlockBranchCommand } from './block-branch.command'

@CommandHandler(BlockBranchCommand)
export class BlockBranchHandler extends BaseCommandHandler<BlockBranchCommand, IBlockedBranch> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: BlockBranchCommand, tx: TxClient): Promise<IBlockedBranch> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.UPDATE, {
        kind: Subject.PROJECT,
        __type: Subject.PROJECT,
        projectId: command.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const existing = await this.blockedBranchRepository.findByProjectAndBranch(
      command.projectId,
      command.branchName,
      tx,
    )
    if (existing) {
      throw new ConflictException('This branch is already blocked')
    }

    return this.blockedBranchRepository.create(
      {
        projectId: command.projectId,
        branchName: command.branchName,
        reason: command.reason,
        createdById: command.userId,
      },
      tx,
    )
  }
}
