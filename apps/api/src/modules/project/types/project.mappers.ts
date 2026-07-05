import type { IProject } from '../interfaces/project.interfaces'
import { ProjectType } from './project.type'
import { ProjectIntegrationsType } from './project-integrations.type'
import { ConnectionHealthType, IntegrationStatus } from './connection-health.type'

export function toConnectionHealth(project: IProject): ConnectionHealthType {
  const health = new ConnectionHealthType()
  health.github = project.integrations.github
    ? IntegrationStatus.CONNECTED
    : IntegrationStatus.NOT_CONFIGURED
  health.linear = project.linearEnabled
    ? IntegrationStatus.CONNECTED
    : IntegrationStatus.NOT_CONFIGURED
  health.flagsmith = project.flagsmithEnabled
    ? IntegrationStatus.CONNECTED
    : IntegrationStatus.NOT_CONFIGURED
  health.slack = project.slackEnabled
    ? IntegrationStatus.CONNECTED
    : IntegrationStatus.NOT_CONFIGURED
  return health
}

export function toProjectType(project: IProject): ProjectType {
  const integrations = new ProjectIntegrationsType()
  integrations.github = project.integrations.github
  integrations.linear = project.integrations.linear
  integrations.flagsmith = project.integrations.flagsmith
  integrations.slack = project.integrations.slack

  const type = new ProjectType()
  type.id = project.id
  type.organizationId = project.organizationId
  type.name = project.name
  type.repo = project.repo
  type.githubAuthMode = project.githubAuthMode
  type.integrations = integrations
  type.connectionHealth = toConnectionHealth(project)
  type.flagReminderIntervalDays = project.flagReminderIntervalDays
  type.conflictEnvironments = project.conflictEnvironments
  type.ownerId = project.ownerId
  type.createdAt = project.createdAt
  type.updatedAt = project.updatedAt
  return type
}
