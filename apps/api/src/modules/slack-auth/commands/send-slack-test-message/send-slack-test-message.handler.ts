import { CommandHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import type { IDomainEvent } from '../../../../common/cqrs/types'
import { BaseCommandHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { IEventEmitter } from '../../../../common/events/event-emitter.abstract'
import { NotFoundException } from '../../../../common/errors'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ISlackConnectionRepository } from '../../interfaces/slack-connection.repository'
import { ISlackApiClient } from '../../interfaces/slack-api-client'
import { SlackTestMessageResult } from '../../types/slack-test-message-result.type'
import { SendSlackTestMessageCommand } from './send-slack-test-message.command'

const TEST_MESSAGE_TEXT = 'Release Hub is connected to this channel. You will receive release notifications here.'

@CommandHandler(SendSlackTestMessageCommand)
export class SendSlackTestMessageHandler extends BaseCommandHandler<
  SendSlackTestMessageCommand,
  SlackTestMessageResult
> {
  constructor(
    protected readonly db: IDatabaseService,
    protected readonly eventEmitter: IEventEmitter,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly slackConnectionRepository: ISlackConnectionRepository,
    private readonly slackApiClient: ISlackApiClient,
  ) {
    super(db, eventEmitter)
  }

  protected async handle(
    command: SendSlackTestMessageCommand,
    tx: TxClient,
    _events: IDomainEvent[],
  ): Promise<SlackTestMessageResult> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: command.userId,
        projectId: command.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.findById(command.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const connection = await this.slackConnectionRepository.findByProject(command.projectId, tx)
    if (!connection) throw new NotFoundException('SlackConnection')

    const result = new SlackTestMessageResult()

    if (!connection.channelId) {
      result.ok = false
      result.error = 'No Slack channel configured'
      return result
    }

    const accessToken = decryptToken(connection.accessToken)
    const postResult = await this.slackApiClient.postMessage(accessToken, connection.channelId, TEST_MESSAGE_TEXT)

    result.ok = postResult.ok
    result.error = postResult.error
    return result
  }
}
