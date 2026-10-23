import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { PreparedCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient } from '../../../integration/interfaces/github-client.interface'
import { IGithubTokenResolver } from '../../../integration/interfaces/github-token-resolver.abstract'
import { IReleaseRepository } from '../../interfaces/release.repository'
import type { ISetReleaseSourceRefPreparation } from '../../interfaces/release-branch.interfaces'
import { ReleaseObjectType } from '../../types/release.type'
import { toReleaseObjectType } from '../../types/release.mappers'
import { SetReleaseSourceRefCommand } from './set-release-source-ref.command'

@CommandHandler(SetReleaseSourceRefCommand)
export class SetReleaseSourceRefHandler extends PreparedCommandHandler<
  SetReleaseSourceRefCommand,
  ISetReleaseSourceRefPreparation,
  ReleaseObjectType
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

  protected async prepare(command: SetReleaseSourceRefCommand): Promise<ISetReleaseSourceRefPreparation> {
    const sourceRef = command.sourceRef.trim()

    const source = await this.db.$transaction(async (tx) => {
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

      if (sourceRef === release.compareRef) {
        throw new AppException(
          'The parent branch must be different from the release branch',
          ErrorCode.VALIDATION_ERROR,
        )
      }

      const project = await this.projectRepository.findById(release.projectId, tx)
      if (!project) throw new NotFoundException('Project')

      const accessToken = await this.tokenResolver.resolveForProject(release.projectId, command.userId, tx)
      return { repo: project.repo, accessToken }
    })

    await this.gitHubClient.getRefSha(source.repo, sourceRef, source.accessToken)

    return { sourceRef }
  }

  protected async handle(
    command: SetReleaseSourceRefCommand,
    tx: TxClient,
    _events: IDomainEvent[],
    prepared: ISetReleaseSourceRefPreparation,
  ): Promise<ReleaseObjectType> {
    const release = await this.releaseRepository.setSourceRef(command.releaseId, prepared.sourceRef, tx)
    return toReleaseObjectType(release)
  }
}
