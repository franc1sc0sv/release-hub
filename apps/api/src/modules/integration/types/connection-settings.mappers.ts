import { GithubAuthMode } from '@release-hub/db'
import type {
  IProjectConnectionCredentials,
  IProjectWebhookSecretStatus,
} from '../../project/interfaces/project.interfaces'
import { ConnectionSettingsType } from './connection-settings.type'

export interface IConnectionSettingsSource {
  projectId: string
  githubAuthMode: GithubAuthMode
  githubInstallationId: string | null
  linearEnabled: boolean
  flagsmithEnabled: boolean
  orgHasActiveInstallation: boolean
  credentials: IProjectConnectionCredentials | null
  webhookSecretStatus: IProjectWebhookSecretStatus | null
}

export function toConnectionSettings(source: IConnectionSettingsSource): ConnectionSettingsType {
  const isInstallation = source.githubAuthMode === GithubAuthMode.installation

  const settings = new ConnectionSettingsType()
  settings.githubAuthMode = source.githubAuthMode
  settings.githubConnected =
    source.orgHasActiveInstallation || (isInstallation && source.githubInstallationId !== null)
  settings.linearConnected = source.linearEnabled
  settings.flagsmithConnected = source.flagsmithEnabled
  settings.flagsmithUrl = source.credentials?.flagsmithUrl ?? null
  settings.flagsmithProjectId = source.credentials?.flagsmithProjectId ?? null
  settings.flagsmithWebhookSecretSet = source.webhookSecretStatus?.flagsmithWebhookSecretSet ?? false
  settings.flagsmithWebhookPath = `/webhooks/flagsmith/${source.projectId}`
  settings.githubWebhookSecretSet = isInstallation
    ? false
    : (source.webhookSecretStatus?.githubWebhookSecretSet ?? false)
  settings.githubWebhookPath = isInstallation ? null : `/webhooks/github/${source.projectId}`
  return settings
}
