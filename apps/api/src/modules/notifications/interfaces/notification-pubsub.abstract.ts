import type { INotification } from './notification.interfaces'

export interface INotificationReceivedPayload {
  notificationReceived: INotification
}

export abstract class INotificationPubSub {
  abstract publish(userId: string, notification: INotification): Promise<void>
  abstract subscribeToUser(userId: string): AsyncIterableIterator<INotificationReceivedPayload>
}
