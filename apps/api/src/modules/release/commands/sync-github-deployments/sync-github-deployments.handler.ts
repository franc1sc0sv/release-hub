import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { ReleaseStatus } from '../../../../common/types/release-status.enum'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { IReleaseRepository } from '../../interfaces/release.repository'
import { ReleaseDeployedEvent } from '../../events/release-deployed.event'
import { SyncGithubDeploymentsResultType } from '../../types/sync-github-deployments-result.type'
import { SyncGithubDeploymentsCommand } from './sync-github-deployments.command'

const PRODUCTION_ENVIRONMENT_NAME_REGEX = /prod(uction)?/i
const DEPLOYMENT_STATE_SUCCESS = 'success'

interface IPreparedDeploymentMatch {
  matched: boolean
  githubDeploymentId: string | null
  environment: string | null
  releaseId: string
  releaseStatus: ReleaseStatus
  projectId: string
}

@CommandHandler(SyncGithubDeploymentsCommand)
export class SyncGithubDeploymentsHandler extends PreparedCommandHandler<
  SyncGithubDeploymentsCommand,
  IPreparedDeploymentMatch,
  SyncGithubDeploymentsResultType
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly releaseRepository: IReleaseRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly tokenResolver: IGithubTokenResolver,
  ) {
    super(db, eventEmitter)
  }

  protected async prepare(command: SyncGithubDeploymentsCommand): Promise<IPreparedDeploymentMatch> {
    const { release, project, accessToken } = await this.db.$transaction(async (tx) => {
      const release = await this.releaseRepository.findById(command.releaseId, tx)
      if (!release) throw new NotFoundException('Release')

      await authorizeProjectAction(
        this.organizationRepository,
        {
          actorId: command.userId,
          projectId: release.projectId,
          action: Action.UPDATE,
          subjectKind: Subject.RELEASE,
        },
        tx,
      )

      const project = await this.projectRepository.findById(release.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const accessToken = await this.tokenResolver.resolveForProject(release.projectId, command.userId, tx)

      return { release, project, accessToken }
    })

    const tagRef = release.name ?? release.compareRef
    const deployments = await this.gitHubClient.listDeployments(project.repo, accessToken, tagRef)

    for (const deployment of deployments) {
      if (!PRODUCTION_ENVIRONMENT_NAME_REGEX.test(deployment.environment)) continue

      const status = await this.gitHubClient.getLatestDeploymentStatus(
        project.repo,
        deployment.id,
        accessToken,
      )
      if (!status || status.state !== DEPLOYMENT_STATE_SUCCESS) continue

      return {
        matched: release.status === ReleaseStatus.MERGED,
        githubDeploymentId: String(deployment.id),
        environment: deployment.environment,
        releaseId: release.id,
        releaseStatus: release.status,
        projectId: release.projectId,
      }
    }

    return {
      matched: false,
      githubDeploymentId: null,
      environment: null,
      releaseId: release.id,
      releaseStatus: release.status,
      projectId: release.projectId,
    }
  }

  protected async handle(
    _command: SyncGithubDeploymentsCommand,
    tx: TxClient,
    events: IDomainEvent[],
    prepared: IPreparedDeploymentMatch,
  ): Promise<SyncGithubDeploymentsResultType> {
    const result = new SyncGithubDeploymentsResultType()
    result.matched = prepared.matched
    result.githubDeploymentId = prepared.githubDeploymentId
    result.environment = prepared.environment

    if (!prepared.matched || prepared.releaseStatus === ReleaseStatus.DEPLOYED) {
      return result
    }

    const updated = await this.releaseRepository.setDeployedStatus(
      prepared.releaseId,
      ReleaseStatus.DEPLOYED,
      new Date(),
      prepared.githubDeploymentId,
      tx,
    )

    events.push(new ReleaseDeployedEvent(updated.id, updated.projectId))

    return result
  }
}
