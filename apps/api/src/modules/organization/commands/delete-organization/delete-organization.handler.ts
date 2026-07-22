import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ConflictException } from '../../../../common/errors'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../interfaces/organization.repository'
import { DeleteOrganizationCommand } from './delete-organization.command'

@CommandHandler(DeleteOrganizationCommand)
export class DeleteOrganizationHandler extends BaseCommandHandler<DeleteOrganizationCommand, boolean> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: DeleteOrganizationCommand, tx: TxClient): Promise<boolean> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: command.actorId,
        organizationId: command.organizationId,
        action: Action.DELETE,
        subjectKind: Subject.ORGANIZATION,
      },
      tx,
    )

    const organizations = await this.organizationRepository.findOrganizationsForUser(command.actorId, tx)
    if (organizations.length <= 1) {
      throw new ConflictException('Cannot delete your only organization')
    }

    await this.organizationRepository.softDeleteProjectsForOrganization(command.organizationId, tx)
    await this.organizationRepository.softDelete(command.organizationId, tx)

    return true
  }
}
