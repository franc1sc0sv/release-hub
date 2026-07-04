import type { INotification } from '../interfaces/notification.interfaces'
import { NotificationEntryType } from './notification-entry.type'

export function toNotificationEntryType(notification: INotification): NotificationEntryType {
  const entry = new NotificationEntryType()
  entry.id = notification.id
  entry.projectId = notification.projectId
  entry.projectName = notification.projectName
  entry.type = notification.type
  entry.title = notification.title
  entry.body = notification.body
  entry.url = notification.url
  entry.flagKey = notification.flagKey
  entry.readAt = notification.readAt
  entry.createdAt = notification.createdAt
  return entry
}
