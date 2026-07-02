import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import { ISlackConnectionRepository } from '../interfaces/slack-connection.repository'
import type {
  IProjectSlackConnection,
  IUpsertProjectSlackConnectionData,
  IUpdateSlackNotificationSettingsData,
  ISetSlackChannelData,
} from '../interfaces/slack-connection.interfaces'

@Injectable()
export class SlackConnectionRepository extends ISlackConnectionRepository {
  upsertForProject = async (
    data: IUpsertProjectSlackConnectionData,
    tx: TxClient,
  ): Promise<IProjectSlackConnection> => {
    const row = await tx.projectSlackConnection.upsert({
      where: { projectId: data.projectId },
      create: {
        projectId: data.projectId,
        accessToken: data.encryptedAccessToken,
        slackTeamId: data.slackTeamId,
        slackTeamName: data.slackTeamName,
      },
      update: {
        accessToken: data.encryptedAccessToken,
        slackTeamId: data.slackTeamId,
        slackTeamName: data.slackTeamName,
      },
    })
    return this.toInterface(row)
  }

  findByProject = async (projectId: string, tx: TxClient): Promise<IProjectSlackConnection | null> => {
    const row = await tx.projectSlackConnection.findUnique({ where: { projectId } })
    if (!row) return null
    return this.toInterface(row)
  }

  deleteByProject = async (projectId: string, tx: TxClient): Promise<void> => {
    await tx.projectSlackConnection.deleteMany({ where: { projectId } })
  }

  updateNotificationSettings = async (
    projectId: string,
    data: IUpdateSlackNotificationSettingsData,
    tx: TxClient,
  ): Promise<IProjectSlackConnection> => {
    const row = await tx.projectSlackConnection.update({
      where: { projectId },
      data: {
        notifyOnCreated: data.notifyOnCreated,
        notifyOnShipped: data.notifyOnShipped,
        notifyOnDeployed: data.notifyOnDeployed,
      },
    })
    return this.toInterface(row)
  }

  updateChannel = async (
    projectId: string,
    data: ISetSlackChannelData,
    tx: TxClient,
  ): Promise<IProjectSlackConnection> => {
    const row = await tx.projectSlackConnection.update({
      where: { projectId },
      data: {
        channelId: data.channelId,
        channelName: data.channelName,
      },
    })
    return this.toInterface(row)
  }

  setProjectSlackEnabled = async (projectId: string, enabled: boolean, tx: TxClient): Promise<void> => {
    await tx.project.update({
      where: { id: projectId },
      data: { slackEnabled: enabled },
    })
  }

  private toInterface(row: {
    id: string
    projectId: string
    accessToken: string
    slackTeamId: string
    slackTeamName: string
    channelId: string | null
    channelName: string | null
    notifyOnCreated: boolean
    notifyOnShipped: boolean
    notifyOnDeployed: boolean
    createdAt: Date
    updatedAt: Date
  }): IProjectSlackConnection {
    return {
      id: row.id,
      projectId: row.projectId,
      accessToken: row.accessToken,
      slackTeamId: row.slackTeamId,
      slackTeamName: row.slackTeamName,
      channelId: row.channelId,
      channelName: row.channelName,
      notifyOnCreated: row.notifyOnCreated,
      notifyOnShipped: row.notifyOnShipped,
      notifyOnDeployed: row.notifyOnDeployed,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
