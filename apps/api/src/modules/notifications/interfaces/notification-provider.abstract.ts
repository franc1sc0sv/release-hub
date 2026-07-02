import type { INotificationPayload } from './notification.interfaces'

export interface INotificationTarget {
  userId: string | null
  email: string | null
  slackChannelId: string | null
  projectId: string
}

export abstract class INotificationProvider {
  abstract send(target: INotificationTarget, payload: INotificationPayload): Promise<void>
}
