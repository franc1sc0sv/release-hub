import type { ProjectRole } from '@release-hub/shared'

export interface IProjectIntegrations {
  github: boolean
  linear: boolean
  flagsmith: boolean
}

export interface IProject {
  id: string
  name: string
  repo: string
  integrations: IProjectIntegrations
  githubInstallationId: string | null
  linearEnabled: boolean
  flagsmithEnabled: boolean
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
  ownerId: string
}

export interface IUpdateProjectData {
  name?: string
  repo?: string
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

export interface IProjectMembershipRecord {
  projectId: string
  role: ProjectRole
}
