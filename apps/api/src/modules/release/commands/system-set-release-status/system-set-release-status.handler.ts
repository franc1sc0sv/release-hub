import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { ReleaseDeployedEvent } from '../../events/release-deployed.event'
import { SystemSetReleaseStatusCommand } from './system-set-release-status.command'

@CommandHandler(SystemSetReleaseStatusCommand)
export class SystemSetReleaseStatusHandler extends BaseCommandHandler<
  SystemSetReleaseStatusCommand,
  ReleaseObjectType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SystemSetReleaseStatusCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<ReleaseObjectType> {
    const release = await this.releaseRepository.findById(command.releaseId, tx)
    if (!release) throw new NotFoundException('Release')

    if (release.status === ReleaseStatus.DEPLOYED) {
      throw new AppException(
        'A deployed release is locked and its status cannot be changed.',
        ErrorCode.CONFLICT,
      )
    }

    const updated =
      command.status === ReleaseStatus.DEPLOYED
        ? await this.releaseRepository.setDeployedStatus(
            command.releaseId,
            command.status,
            new Date(),
            command.githubDeploymentId,
            tx,
          )
        : await this.releaseRepository.setStatus(command.releaseId, command.status, tx)

    if (command.status === ReleaseStatus.DEPLOYED) {
      events.push(new ReleaseDeployedEvent(updated.id, updated.projectId))
    }

    return toReleaseObjectType(updated)
  }
}
