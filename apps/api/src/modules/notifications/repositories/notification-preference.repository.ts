import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import type { NotificationType, NotificationChannel, DigestFrequency } from '@release-hub/db'
import { INotificationPreferenceRepository } from '../interfaces/notification-preference.repository'
import type {
  IUserNotificationPreference,
  IUpsertUserNotificationPreferenceData,
} from '../interfaces/notification.interfaces'

interface IUserNotificationPreferenceRow {
  id: string
  userId: string
  projectId: string
  notificationType: NotificationType
  channel: NotificationChannel
  enabled: boolean
  digestFrequency: DigestFrequency | null
}

function toIUserNotificationPreference(row: IUserNotificationPreferenceRow): IUserNotificationPreference {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId,
    notificationType: row.notificationType,
    channel: row.channel,
    enabled: row.enabled,
    digestFrequency: row.digestFrequency,
  }
}

@Injectable()
export class NotificationPreferenceRepository extends INotificationPreferenceRepository {
  findById = async (id: string, tx: TxClient): Promise<IUserNotificationPreference | null> => {
    const row = await tx.userNotificationPreference.findFirst({ where: { id } })
    if (!row) return null
    return toIUserNotificationPreference(row)
  }

  findAllForUserAndProject = async (
    userId: string,
    projectId: string,
    tx: TxClient,
  ): Promise<IUserNotificationPreference[]> => {
    const rows = await tx.userNotificationPreference.findMany({ where: { userId, projectId } })
    return rows.map(toIUserNotificationPreference)
  }

  findAllForUsersAndProject = async (
    userIds: string[],
    projectId: string,
    tx: TxClient,
  ): Promise<IUserNotificationPreference[]> => {
    if (userIds.length === 0) return []
    const rows = await tx.userNotificationPreference.findMany({
      where: { userId: { in: userIds }, projectId },
    })
    return rows.map(toIUserNotificationPreference)
  }

  upsert = async (
    data: IUpsertUserNotificationPreferenceData,
    tx: TxClient,
  ): Promise<IUserNotificationPreference> => {
    const row = await tx.userNotificationPreference.upsert({
      where: {
        userId_projectId_notificationType_channel: {
          userId: data.userId,
          projectId: data.projectId,
          notificationType: data.notificationType,
          channel: data.channel,
        },
      },
      update: { enabled: data.enabled, digestFrequency: data.digestFrequency },
      create: {
        userId: data.userId,
        projectId: data.projectId,
        notificationType: data.notificationType,
        channel: data.channel,
        enabled: data.enabled,
        digestFrequency: data.digestFrequency,
      },
    })
    return toIUserNotificationPreference(row)
  }
}
