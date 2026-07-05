import { QueryHandler } from '@nestjs/cqrs'
import type { TxClient } from '@release-hub/db'
import { Action, Subject } from '@release-hub/shared'
import { BaseQueryHandler } from '../../../../common/cqrs'
import { IDatabaseService } from '../../../../common/database/database.abstract'
import { NotFoundException } from '../../../../common/errors'
import { authorizeProjectAction } from '../../../../common/authz/authorize-org-action'
import { IOrganizationRepository } from '../../../organization/interfaces/organization.repository'
import { IProjectRepository } from '../../../project/interfaces/project.repository'
import { ISlackConnectionRepository } from '../../interfaces/slack-connection.repository'
import { SlackConnectionStatus } from '../../types/slack-connection-status.type'
import { GetSlackConnectionQuery } from './get-slack-connection.query'

@QueryHandler(GetSlackConnectionQuery)
export class GetSlackConnectionHandler extends BaseQueryHandler<GetSlackConnectionQuery, SlackConnectionStatus> {
  constructor(
    protected readonly db: IDatabaseService,
    private readonly orgRepository: IOrganizationRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly slackConnectionRepository: ISlackConnectionRepository,
  ) {
    super(db)
  }

  protected async handle(
    query: GetSlackConnectionQuery,
    tx: TxClient,
  ): Promise<SlackConnectionStatus> {
    await authorizeProjectAction(
      this.orgRepository,
      {
        actorId: query.userId,
        projectId: query.projectId,
        action: Action.READ,
        subjectKind: Subject.PROJECT,
      },
      tx,
    )

    const project = await this.projectRepository.findById(query.projectId, tx)
    if (!project) throw new NotFoundException('Project')

    const connection = await this.slackConnectionRepository.findByProject(query.projectId, tx)

    const status = new SlackConnectionStatus()
    status.connected = connection !== null
    status.teamName = connection?.slackTeamName ?? null
    status.channelId = connection?.channelId ?? null
    status.channelName = connection?.channelName ?? null
    status.notifyOnCreated = connection?.notifyOnCreated ?? true
    status.notifyOnShipped = connection?.notifyOnShipped ?? true
    status.notifyOnDeployed = connection?.notifyOnDeployed ?? true
    return status
  }
}
