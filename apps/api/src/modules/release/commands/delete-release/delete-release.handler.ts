import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { DeleteReleaseCommand } from './delete-release.command'

@CommandHandler(DeleteReleaseCommand)
export class DeleteReleaseHandler extends BaseCommandHandler<DeleteReleaseCommand, ReleaseObjectType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: DeleteReleaseCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<ReleaseObjectType> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (
      !ability.can(Action.DELETE, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: release.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    if (release.status === ReleaseStatus.DEPLOYED) {
      throw new AppException('A deployed release cannot be deleted.', ErrorCode.CONFLICT)
    }

    const deleted = await this.releaseRepository.softDelete(command.releaseId, tx)
    return toReleaseObjectType(deleted)
  }
}
