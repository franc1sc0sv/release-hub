import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { defineAbilityFor, Action, Subject } from '@release-hub/shared'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { ForbiddenException, NotFoundException } from '../../../../common/errors'
import { AppException } from '../../../../common/errors/app.exception'
import { ErrorCode } from '../../../../common/errors/error-codes.enum'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { IGitHubClient, type IGitHubBranch } from '../../../integration/interfaces/github-client.interface'
import { IGithubConnectionRepository } from '../../interfaces/github-connection.repository'
import { CreateGithubBranchCommand } from './create-github-branch.command'

@CommandHandler(CreateGithubBranchCommand)
export class CreateGithubBranchHandler extends BaseCommandHandler<CreateGithubBranchCommand, IGitHubBranch> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly projectRepository: IProjectRepository,
    private readonly gitHubClient: IGitHubClient,
    private readonly githubConnectionRepository: IGithubConnectionRepository,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: CreateGithubBranchCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<IGitHubBranch> {
    const memberships = await this.projectRepository.findMembershipsForUser(command.userId, tx)
    const ability = defineAbilityFor(memberships)

    if (
      !ability.can(Action.CREATE, {
        kind: Subject.RELEASE,
        __type: Subject.RELEASE,
        projectId: command.projectId,
      })
    ) {
      throw new ForbiddenException()
    }

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const accessToken = await this.resolveAccessToken(command.userId, tx)
    return this.gitHubClient.createBranch(project.repo, command.name, command.fromRef, accessToken)
  }

  private async resolveAccessToken(userId: string, tx: TxClient): Promise<string> {
    const connection = await this.githubConnectionRepository.findByUserId(userId, tx)
    if (!connection) {
      throw new AppException(
        'GitHub is not connected. Please connect your GitHub account in settings.',
        ErrorCode.GITHUB_NOT_CONNECTED,
      )
    }
    return decryptToken(connection.accessToken)
  }
}
