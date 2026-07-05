import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../interfaces/organization.repository'
import { OrganizationType } from '../../types/organization.type'
import { toOrganizationType } from '../../types/organization.mappers'
import { generateUniqueSlug, slugify } from '../../utils/slug'
import { UpdateOrganizationCommand } from './update-organization.command'

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler extends BaseCommandHandler<UpdateOrganizationCommand, OrganizationType> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(command: UpdateOrganizationCommand, tx: TxClient): Promise<OrganizationType> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId: command.actorId,
        organizationId: command.organizationId,
        action: Action.UPDATE,
        subjectKind: Subject.ORGANIZATION,
      },
      tx,
    )

    const existing = await this.organizationRepository.findById(command.organizationId, tx)
    if (!existing) throw new NotFoundException('Organization')

    const slug =
      slugify(command.name) === existing.slug
        ? existing.slug
        : await generateUniqueSlug(command.name, (candidate) =>
            this.organizationRepository.slugExists(candidate, tx),
          )

    const updated = await this.organizationRepository.updateName(command.organizationId, command.name, slug, tx)

    const memberships = await this.organizationRepository.findOrgMembershipsForUser(command.actorId, tx)
    const membership = memberships.find((entry) => entry.organizationId === command.organizationId)
    if (!membership) throw new NotFoundException('Organization')

    const activeInstallationId = await this.organizationRepository.findActiveInstallationIdForOrg(
      command.organizationId,
      tx,
    )

    return toOrganizationType({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      role: membership.role,
      githubConnected: activeInstallationId !== null,
    })
  }
}
