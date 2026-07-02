import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { IReleaseRepository } from '../../interfaces/release.repository'
import type { IRelease } from '../../interfaces/release.interfaces'
import type {
  IGithubDeploymentStatusWebhookPayload,
  IParsedGithubDeploymentWebhookEvent,
} from '../../interfaces/github-deployment-webhook.interfaces'
import { ReleaseDeployedEvent } from '../../events/release-deployed.event'
import { HandleGithubDeploymentWebhookCommand } from './handle-github-deployment-webhook.command'

const PRODUCTION_ENVIRONMENT_NAME_REGEX = /prod(uction)?/i
const DEPLOYMENT_STATE_SUCCESS = 'success'
const DEPLOYMENT_STATUS_ACTION = 'created'

@CommandHandler(HandleGithubDeploymentWebhookCommand)
export class HandleGithubDeploymentWebhookHandler extends BaseCommandHandler<
  HandleGithubDeploymentWebhookCommand,
  void
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly releaseRepository: IReleaseRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: HandleGithubDeploymentWebhookCommand,
    tx: TxClient,
    events: IDomainEvent[],
  ): Promise<void> {
    const parsed = this.parsePayload(command.payload)
    if (!parsed) return

    if (parsed.state !== DEPLOYMENT_STATE_SUCCESS) return
    if (!PRODUCTION_ENVIRONMENT_NAME_REGEX.test(parsed.environment)) return

    const releases = await this.releaseRepository.findAllByProject(command.projectId, tx)
    const matched = releases.find((release) => this.matchesRelease(release, parsed))
    if (!matched) return
    if (matched.status !== ReleaseStatus.MERGED) return

    const updated = await this.releaseRepository.setDeployedStatus(
      matched.id,
      ReleaseStatus.DEPLOYED,
      new Date(),
      parsed.githubDeploymentId,
      tx,
    )

    events.push(new ReleaseDeployedEvent(updated.id, updated.projectId))
  }

  private matchesRelease(release: IRelease, parsed: IParsedGithubDeploymentWebhookEvent): boolean {
    const tag = release.name ?? release.compareRef
    return parsed.ref === tag || parsed.ref === release.compareRef || parsed.sha === release.compareRef
  }

  private parsePayload(
    payload: IGithubDeploymentStatusWebhookPayload,
  ): IParsedGithubDeploymentWebhookEvent | null {
    if (payload.action !== DEPLOYMENT_STATUS_ACTION) return null
    if (!payload.deployment || !payload.deployment_status) return null

    return {
      githubDeploymentId: String(payload.deployment.id),
      ref: payload.deployment.ref,
      sha: payload.deployment.sha,
      environment: payload.deployment_status.environment,
      state: payload.deployment_status.state,
      repoFullName: payload.repository?.full_name ?? '',
    }
  }
}
