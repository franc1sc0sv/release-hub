export interface IProjectIntegrations {
  github: boolean
  linear: boolean
  flagsmith: boolean
  slack: boolean
}

export interface IProject {
  id: string
  organizationId: string
  name: string
  repo: string
  integrations: IProjectIntegrations
  githubInstallationId: string | null
  linearEnabled: boolean
  flagsmithEnabled: boolean
  slackEnabled: boolean
  flagReminderIntervalDays: number
  conflictEnvironments: string[]
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface IProjectFilters {
  userId?: string
}

export interface ICreateProjectData {
  name: string
  repo: string
  organizationId: string
  githubInstallationId?: string
}

export interface IUpdateProjectData {
  name?: string
  repo?: string
  flagReminderIntervalDays?: number
  conflictEnvironments?: string[]
}

export interface IProjectIntegrationSettings {
  linearEnabled?: boolean
  flagsmithApiKey?: string | null
  flagsmithUrl?: string | null
  flagsmithProjectId?: string | null
}

export interface IProjectConnectionCredentials {
  flagsmithUrl: string | null
  flagsmithApiKey: string | null
  flagsmithProjectId: string | null
}

export interface IProjectWebhookSecretStatus {
  flagsmithWebhookSecretSet: boolean
  githubWebhookSecretSet: boolean
}

export interface IFlagRegistryConfig {
  repo: string
  flagRegistryPath: string | null
  flagRegistryBranch: string | null
}

export interface IUpdateFlagRegistryData {
  flagRegistryPath: string
  flagRegistryBranch: string | null
}

export interface IFlagRegistryConfigResult {
  projectId: string
  flagRegistryPath: string | null
  flagRegistryBranch: string | null
}
