import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IBlockedBranchRepository } from '../../interfaces/blocked-branch.repository'
import { UnblockBranchCommand } from './unblock-branch.command'

@CommandHandler(UnblockBranchCommand)
export class UnblockBranchHandler extends BaseCommandHandler<UnblockBranchCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: UnblockBranchCommand, tx: TxClient): Promise<boolean> {
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

    const existing = await this.blockedBranchRepository.findByProjectAndBranch(
      command.projectId,
      command.branchName,
      tx,
    )
    if (!existing) throw new NotFoundException('BlockedBranch')

    await this.blockedBranchRepository.deleteByProjectAndBranch(command.projectId, command.branchName, tx)

    return true
  }
}
