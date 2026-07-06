import type {
  IProjectConnectionCredentials,
  IProjectWebhookSecretStatus,
} from '../../project/interfaces/project.interfaces'
import { ConnectionSettingsType } from './connection-settings.type'

export interface IConnectionSettingsSource {
  projectId: string
  githubInstallationId: string | null
  linearEnabled: boolean
  flagsmithEnabled: boolean
  orgHasActiveInstallation: boolean
  credentials: IProjectConnectionCredentials | null
  webhookSecretStatus: IProjectWebhookSecretStatus | null
}

export function toConnectionSettings(source: IConnectionSettingsSource): ConnectionSettingsType {
  const settings = new ConnectionSettingsType()
  settings.githubConnected = source.orgHasActiveInstallation || source.githubInstallationId !== null
  settings.linearConnected = source.linearEnabled
  settings.flagsmithConnected = source.flagsmithEnabled
  settings.flagsmithUrl = source.credentials?.flagsmithUrl ?? null
  settings.flagsmithProjectId = source.credentials?.flagsmithProjectId ?? null
  settings.flagsmithWebhookSecretSet = source.webhookSecretStatus?.flagsmithWebhookSecretSet ?? false
  settings.flagsmithWebhookPath = `/webhooks/flagsmith/${source.projectId}`
  settings.githubWebhookSecretSet = false
  settings.githubWebhookPath = null
  return settings
}
