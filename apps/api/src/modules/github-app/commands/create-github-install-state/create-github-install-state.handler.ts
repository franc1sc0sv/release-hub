import { randomBytes } from 'node:crypto'
import { CommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException } from '../../../../common/errors'
import { authorizeOrgAction, authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IGithubInstallStateRepository } from '../../interfaces/github-install-state.repository'
import type { IGithubInstallStatePayload } from '../../interfaces/github-install-state.interfaces'
import {
  GH_INSTALL_STATE_PURPOSE,
  GH_INSTALL_STATE_TTL_MINUTES,
  GITHUB_INSTALL_URL_BASE,
} from '../../github-app.constants'
import { CreateGithubInstallStateCommand } from './create-github-install-state.command'

@CommandHandler(CreateGithubInstallStateCommand)
export class CreateGithubInstallStateHandler extends BaseCommandHandler<
  CreateGithubInstallStateCommand,
  string
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly installStateRepository: IGithubInstallStateRepository,
    private readonly jwtService: JwtService,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateGithubInstallStateCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<string> {
    const organizationId = command.organizationId
      ? await this.authorizeOrganization(command.actorId, command.organizationId, tx)
      : command.projectId
        ? await authorizeProjectAction(
            this.organizationRepository,
            {
              actorId: command.actorId,
              projectId: command.projectId,
              action: Action.READ,
              subjectKind: Subject.ORGANIZATION,
            },
            tx,
          )
        : await this.resolveActiveOrganization(command.actorId, tx)

    const nonce = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + GH_INSTALL_STATE_TTL_MINUTES * 60 * 1000)

    await this.installStateRepository.create(
      { nonce, organizationId, projectId: command.projectId, expiresAt },
      tx,
    )

    const payload: IGithubInstallStatePayload = {
      orgId: organizationId,
      projectId: command.projectId,
      nonce,
      purpose: GH_INSTALL_STATE_PURPOSE,
    }
    const state = this.jwtService.sign(payload, {
      expiresIn: `${GH_INSTALL_STATE_TTL_MINUTES}m`,
    })

    return `${GITHUB_INSTALL_URL_BASE}/${process.env.GITHUB_APP_SLUG}/installations/new?state=${state}`
  }

  private async resolveActiveOrganization(actorId: string, tx: TxClient): Promise<string> {
    const memberships = await this.organizationRepository.findOrgMembershipsForUser(actorId, tx)
    const organizationId = memberships[0]?.organizationId
    if (!organizationId) throw new ForbiddenException()
    return organizationId
  }

  private async authorizeOrganization(
    actorId: string,
    organizationId: string,
    tx: TxClient,
  ): Promise<string> {
    await authorizeOrgAction(
      this.organizationRepository,
      {
        actorId,
        organizationId,
        action: Action.UPDATE,
        subjectKind: Subject.ORGANIZATION,
      },
      tx,
    )
    return organizationId
  }
}
