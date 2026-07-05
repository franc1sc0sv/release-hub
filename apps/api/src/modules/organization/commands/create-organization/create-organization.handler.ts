import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { OrgRole } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { IOrganizationRepository } from '../../interfaces/organization.repository'
import { OrganizationType } from '../../types/organization.type'
import { toOrganizationType } from '../../types/organization.mappers'
import { generateUniqueSlug } from '../../utils/slug'
import { CreateOrganizationCommand } from './create-organization.command'

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler extends BaseCommandHandler<CreateOrganizationCommand, OrganizationType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: CreateOrganizationCommand, tx: TxClient): Promise<OrganizationType> {
    const slug = await generateUniqueSlug(command.name, (candidate) =>
      this.organizationRepository.slugExists(candidate, tx),
    )

    const organization = await this.organizationRepository.createForUser(command.userId, command.name, slug, tx)

    return toOrganizationType({
      id: organization.id,
      name: command.name,
      slug,
      role: OrgRole.OWNER,
      githubConnected: false,
    })
  }
}
