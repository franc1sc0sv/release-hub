import type { NotificationType } from '../../../common/types/notification-type.enum'
import type { NotificationChannel } from '../../../common/types/notification-channel.enum'
import type { DigestFrequency } from '../../../common/types/digest-frequency.enum'

export interface INotificationPayload {
  type: NotificationType
  title: string
  bodyLines: string[]
  url: string | null
  projectId: string
  releaseId: string | null
  flagIds: string[]
  flagKey: string | null
}

export interface INotificationRecipientUser {
  id: string
  email: string
  name: string
}

export interface INotificationPreferenceMatrixEntry {
  notificationType: NotificationType
  channel: NotificationChannel
  enabled: boolean
  digestFrequency: DigestFrequency
}

export interface IUserNotificationPreference {
  id: string
  userId: string
  projectId: string
  notificationType: NotificationType
  channel: NotificationChannel
  enabled: boolean
  digestFrequency: DigestFrequency | null
}

export interface IUpsertUserNotificationPreferenceData {
  userId: string
  projectId: string
  notificationType: NotificationType
  channel: NotificationChannel
  enabled: boolean
  digestFrequency: DigestFrequency | null
}

export interface IProjectSlackConnectionSummary {
  id: string
  projectId: string
  accessToken: string
  channelId: string | null
  notifyOnCreated: boolean
  notifyOnShipped: boolean
  notifyOnDeployed: boolean
}

export interface IProjectMemberForNotification {
  userId: string
  email: string
  name: string
}

export interface IProjectForDigest {
  id: string
  name: string
  flagStaleDays: number
  flagReminderIntervalDays: number
}

export interface IStaleFlagCandidate {
  trackedFlagId: string
  projectId: string
  key: string
  lastRemindedAt: Date | null
  decidedAt: Date | null
}

export interface IInProgressFlagSummary {
  trackedFlagId: string
  key: string
}

export interface IEnabledProdFlagSummary {
  trackedFlagId: string | null
  key: string
}

export interface IDeployedReleaseSummary {
  releaseId: string
  projectId: string
  name: string | null
  prUrl: string | null
  deployedAt: Date
}

export interface IShipOffReminderCandidate {
  trackedFlagId: string
  projectId: string
  key: string
  lastRemindedAt: Date | null
  decidedAt: Date | null
}

export interface INotification {
  id: string
  userId: string
  projectId: string
  projectName: string
  type: NotificationType
  title: string
  body: string
  url: string | null
  flagKey: string | null
  readAt: Date | null
  createdAt: Date
}

export interface ICreateNotificationData {
  userId: string
  projectId: string
  type: NotificationType
  title: string
  body: string
  url: string | null
  flagKey: string | null
}

export interface INotificationsPageFilters {
  userId: string
  limit: number
  offset: number
  projectId?: string
}

export interface INotificationsPage {
  items: INotification[]
  totalCount: number
  hasMore: boolean
}
