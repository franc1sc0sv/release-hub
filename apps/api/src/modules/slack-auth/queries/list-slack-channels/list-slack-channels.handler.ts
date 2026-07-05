import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException, IntegrationException } from '../../../../common/errors'
import { decryptToken } from '../../../../common/crypto/token-cipher'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ISlackConnectionRepository } from '../../interfaces/slack-connection.repository'
import { ISlackApiClient } from '../../interfaces/slack-api-client'
import { SlackChannel } from '../../types/slack-channel.type'
import { ListSlackChannelsQuery } from './list-slack-channels.query'

const MAX_PAGES = 1

@QueryHandler(ListSlackChannelsQuery)
export class ListSlackChannelsHandler extends BaseQueryHandler<ListSlackChannelsQuery, SlackChannel[]> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly slackConnectionRepository: ISlackConnectionRepository,
    private readonly slackApiClient: ISlackApiClient,
  ) {
    super(db)
  }

  protected async handle(
    query: ListSlackChannelsQuery,
    tx: TxClient,
  ): Promise<SlackChannel[]> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.UPDATE,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const connection = await this.slackConnectionRepository.findByProject(query.projectId, tx)
    if (!connection) throw new IntegrationException('Slack is not connected for this project')

    const accessToken = decryptToken(connection.accessToken)
    const channels: SlackChannel[] = []
    let cursor: string | null = null
    let page = 0

    do {
      const result = await this.slackApiClient.listChannels(accessToken, cursor)
      if (!result.ok) {
        throw new IntegrationException(result.error ?? 'Failed to list Slack channels')
      }
      for (const channel of result.channels) {
        channels.push(Object.assign(new SlackChannel(), channel))
      }
      cursor = result.nextCursor
      page += 1
    } while (cursor && page < MAX_PAGES)

    return channels
  }
}
