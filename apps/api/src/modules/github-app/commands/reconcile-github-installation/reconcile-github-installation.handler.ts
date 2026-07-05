import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { GithubInstallationStatus } from '@release-hub/db'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import type { IDomainEvent } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { IGithubAppAuth, type IGithubInstallationInfo } from '../../../integration/interfaces/github-app-auth.abstract'
import type { IGithubRepository } from '../../../integration/interfaces/github-client.interface'
import { IGithubInstallationRepository } from '../../interfaces/github-installation.repository'
import { ReconcileGithubInstallationCommand } from './reconcile-github-installation.command'

const INSTALLATION_ACTION_DELETED = 'deleted'
const INSTALLATION_ACTION_SUSPEND = 'suspend'
const INSTALLATION_ACTION_UNSUSPEND = 'unsuspend'

interface IReconcileGithubInstallationPrepared {
  installation: IGithubInstallationInfo
  repositories: IGithubRepository[]
}

@CommandHandler(ReconcileGithubInstallationCommand)
export class ReconcileGithubInstallationHandler extends PreparedCommandHandler<
  ReconcileGithubInstallationCommand,
  IReconcileGithubInstallationPrepared | null
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly githubAppAuth: IGithubAppAuth,
    private readonly installationRepository: IGithubInstallationRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(
    command: ReconcileGithubInstallationCommand,
  ): Promise<IReconcileGithubInstallationPrepared | null> {
    if (this.statusForAction(command.action)) return null

    const [installation, repositories] = await Promise.all([
      this.githubAppAuth.getInstallation(command.installationId),
      this.githubAppAuth.listInstallationRepositories(command.installationId),
    ])
    return { installation, repositories }
  }

  protected async handle(
    command: ReconcileGithubInstallationCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: IReconcileGithubInstallationPrepared | null,
  ): Promise<void> {
    const status = this.statusForAction(command.action)
    if (status) {
      const existing = await this.installationRepository.findByInstallationId(command.installationId, tx)
      if (existing) {
        await this.installationRepository.setStatus(command.installationId, status, tx)
      }
      return
    }

    if (!prepared) return

    const installationRow = await this.installationRepository.upsertByInstallationId(
      {
        installationId: command.installationId,
        organizationId: null,
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
  }

  private statusForAction(action: string): GithubInstallationStatus | null {
    if (action === INSTALLATION_ACTION_DELETED) return GithubInstallationStatus.deleted
    if (action === INSTALLATION_ACTION_SUSPEND) return GithubInstallationStatus.suspended
    if (action === INSTALLATION_ACTION_UNSUSPEND) return GithubInstallationStatus.active
    return null
  }
}
