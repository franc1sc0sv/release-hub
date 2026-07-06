import { Logger } from '@nestjs/common'
import { CommandBus, CommandHandler, type ICommandHandler } from '@nestjs/cqrs'
import { JwtService } from '@nestjs/jwt'
import { Action, Subject } from '@release-hub/shared'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { AppException, ErrorCode } from '../../../../common/errors'
import { authorizeOrgAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IGithubAppAuth } from '../../../integration/interfaces/github-app-auth.abstract'
import { IGithubInstallationRepository } from '../../interfaces/github-installation.repository'
import { IGithubInstallStateRepository } from '../../interfaces/github-install-state.repository'
import type { IGithubInstallStatePayload } from '../../interfaces/github-install-state.interfaces'
import { GH_INSTALL_STATE_PURPOSE } from '../../github-app.constants'
import { GithubInstallResultType } from '../../types/github-install-result.type'
import { LinkGithubInstallationCommand } from '../link-github-installation/link-github-installation.command'
import { CompleteGithubInstallationCommand } from './complete-github-installation.command'

@CommandHandler(CompleteGithubInstallationCommand)
export class CompleteGithubInstallationHandler
  implements ICommandHandler<CompleteGithubInstallationCommand, GithubInstallResultType>
{
  private readonly logger = new Logger(CompleteGithubInstallationHandler.name)

  constructor(
    private readonly db: IDatabaseService,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly installStateRepository: IGithubInstallStateRepository,
    private readonly installationRepository: IGithubInstallationRepository,
    private readonly githubAppAuth: IGithubAppAuth,
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CompleteGithubInstallationCommand): Promise<GithubInstallResultType> {
    this.logger.log(`complete: start installationId=${command.installationId} userId=${command.userId}`)
    const payload = this.verifyState(command.state)
    this.logger.log(`complete: state verified orgId=${payload.orgId}`)

    await this.db.$query((tx) =>
      authorizeOrgAction(
        this.organizationRepository,
        {
          actorId: command.userId,
          organizationId: payload.orgId,
          action: Action.UPDATE,
          subjectKind: Subject.ORGANIZATION,
        },
        tx,
      ),
    )

    const numericInstallationId = Number(command.installationId)

    const existingInstallation = await this.db.$query((tx) =>
      this.installationRepository.findByInstallationId(numericInstallationId, tx),
    )
    if (existingInstallation?.organizationId && existingInstallation.organizationId !== payload.orgId) {
      throw new AppException(
        'This GitHub installation is already linked to another organization.',
        ErrorCode.GITHUB_INSTALL_STATE_INVALID,
      )
    }

    const consumed = await this.db.$transaction((tx) =>
      this.installStateRepository.consume(payload.nonce, tx),
    )
    this.logger.log(`complete: install state consumed=${consumed} installationId=${numericInstallationId}`)
    if (!consumed) {
      throw new AppException(
        'Install state has expired or was already used.',
        ErrorCode.GITHUB_INSTALL_STATE_EXPIRED,
      )
    }

    let installation
    try {
      installation = await this.githubAppAuth.getInstallation(numericInstallationId)
    } catch (error) {
      this.logger.error(
        `complete: getInstallation failed installationId=${numericInstallationId}: ${error instanceof Error ? error.message : String(error)}`,
      )
      throw error
    }
    if (installation.installationId !== numericInstallationId) {
      throw new AppException('Invalid GitHub App installation.', ErrorCode.GITHUB_INSTALL_STATE_INVALID)
    }

    await this.commandBus.execute(
      new LinkGithubInstallationCommand(payload.orgId, numericInstallationId, payload.projectId),
    )

    this.logger.log(`complete: linked orgId=${payload.orgId} installationId=${numericInstallationId}`)
    return { organizationId: payload.orgId, connected: true }
  }

  private verifyState(state: string): IGithubInstallStatePayload {
    let payload: IGithubInstallStatePayload
    try {
      payload = this.jwtService.verify<IGithubInstallStatePayload>(state)
    } catch {
      throw new AppException('Invalid or expired install state.', ErrorCode.GITHUB_INSTALL_STATE_INVALID)
    }

    if (payload.purpose !== GH_INSTALL_STATE_PURPOSE) {
      throw new AppException('Invalid or expired install state.', ErrorCode.GITHUB_INSTALL_STATE_INVALID)
    }

    return payload
  }
}
