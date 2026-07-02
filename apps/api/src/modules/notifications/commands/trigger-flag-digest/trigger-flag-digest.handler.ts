import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { INotificationReadRepository } from '../../interfaces/notification-read.repository'
import { DigestFrequency } from '../../../../common/types/digest-frequency.enum'
import { FlagDigestService } from '../../services/flag-digest.service'
import { TriggerFlagDigestCommand } from './trigger-flag-digest.command'

@CommandHandler(TriggerFlagDigestCommand)
export class TriggerFlagDigestHandler extends PreparedCommandHandler<
  TriggerFlagDigestCommand,
  void,
  boolean
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly flagDigestService: FlagDigestService,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: TriggerFlagDigestCommand): Promise<void> {
    const memberships = await this.db.$transaction((tx) =>
      this.projectRepository.findMembershipsForUser(command.userId, tx),
    )
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

    const projects = await this.db.$transaction((tx) =>
      this.notificationReadRepository.findAllActiveProjects(tx),
    )
    const project = projects.find((candidate) => candidate.id === command.projectId)
    if (!project) throw new NotFoundException('Project')

    await this.flagDigestService.sendDigestForProject(project, DigestFrequency.WEEKLY)
    await this.flagDigestService.sendDigestForProject(project, DigestFrequency.DAILY)
  }

  protected async handle(
    _command: TriggerFlagDigestCommand,
    _tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<boolean> {
    return true
  }
}
