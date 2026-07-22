import { Injectable } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import {
  INotificationPubSub,
  type INotificationReceivedPayload,
} from '../interfaces/notification-pubsub.abstract'
import type { INotification } from '../interfaces/notification.interfaces'

function notificationChannel(userId: string): string {
  return `notificationReceived.${userId}`
}

@Injectable()
export class NotificationPubSubService extends INotificationPubSub {
  private readonly pubSub = new PubSub()

  async publish(userId: string, notification: INotification): Promise<void> {
    await this.pubSub.publish(notificationChannel(userId), { notificationReceived: notification })
  }

  subscribeToUser(userId: string): AsyncIterableIterator<INotificationReceivedPayload> {
    return this.pubSub.asyncIterableIterator<INotificationReceivedPayload>(notificationChannel(userId))
  }
}
