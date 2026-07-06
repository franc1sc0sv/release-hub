import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { GithubInstallationStatus } from '@release-hub/db'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { IGithubAppAuth, type IGithubInstallationInfo } from '../../../integration/interfaces/github-app-auth.abstract'
import type { IGithubRepository } from '../../../integration/interfaces/github-client.interface'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IGithubInstallationRepository } from '../../interfaces/github-installation.repository'
import { LinkGithubInstallationCommand } from './link-github-installation.command'

interface ILinkGithubInstallationPrepared {
  installation: IGithubInstallationInfo
  repositories: IGithubRepository[]
}

@CommandHandler(LinkGithubInstallationCommand)
export class LinkGithubInstallationHandler extends PreparedCommandHandler<
  LinkGithubInstallationCommand,
  ILinkGithubInstallationPrepared
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly githubAppAuth: IGithubAppAuth,
    private readonly installationRepository: IGithubInstallationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(
    command: LinkGithubInstallationCommand,
  ): Promise<ILinkGithubInstallationPrepared> {
    const [installation, repositories] = await Promise.all([
      this.githubAppAuth.getInstallation(command.installationId),
      this.githubAppAuth.listInstallationRepositories(command.installationId),
    ])
    return { installation, repositories }
  }

  protected async handle(
    command: LinkGithubInstallationCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: ILinkGithubInstallationPrepared,
  ): Promise<void> {
    const installationRow = await this.installationRepository.upsertByInstallationId(
      {
        installationId: command.installationId,
        organizationId: command.organizationId,
        accountLogin: prepared.installation.accountLogin,
        accountType: prepared.installation.accountType,
        accountId: prepared.installation.accountId,
        repositorySelection: prepared.installation.repositorySelection,
        status: GithubInstallationStatus.active,
      },
      tx,
    )

    await this.installationRepository.replaceRepositories(
      installationRow.id,
      prepared.repositories.map((repo) => ({
        repoId: repo.githubId,
        fullName: repo.fullName,
        private: repo.private,
      })),
      tx,
    )

    if (!command.projectId) return

    const projectOrganizationId = await this.organizationRepository.findOrganizationIdForProject(
      command.projectId,
      tx,
    )
    if (projectOrganizationId !== command.organizationId) return

    await this.projectRepository.setInstallationMode(
      command.projectId,
      String(command.installationId),
      tx,
    )
  }
}
