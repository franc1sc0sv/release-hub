export interface IProjectSlackConnection {
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
}

export interface IUpsertProjectSlackConnectionData {
  projectId: string
  encryptedAccessToken: string
  slackTeamId: string
  slackTeamName: string
}

export interface IUpdateSlackNotificationSettingsData {
  notifyOnCreated?: boolean
  notifyOnShipped?: boolean
  notifyOnDeployed?: boolean
}

export interface ISetSlackChannelData {
  channelId: string
  channelName: string
}
