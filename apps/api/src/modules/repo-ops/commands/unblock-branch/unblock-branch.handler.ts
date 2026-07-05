import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IBlockedBranchRepository } from '../../interfaces/blocked-branch.repository'
import { UnblockBranchCommand } from './unblock-branch.command'

@CommandHandler(UnblockBranchCommand)
export class UnblockBranchHandler extends BaseCommandHandler<UnblockBranchCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly blockedBranchRepository: IBlockedBranchRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: UnblockBranchCommand, tx: TxClient): Promise<boolean> {
    await authorizeProjectAction(
      this.organizationRepository,
      {
        actorId: command.userId,
        projectId: command.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

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
