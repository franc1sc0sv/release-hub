import { Injectable } from '@nestjs/common'
import type { TxClient } from '@release-hub/db'
import type { NotificationType } from '@release-hub/db'
import { INotificationRepository } from '../interfaces/notification.repository'
import type {
  INotification,
  ICreateNotificationData,
  INotificationsPageFilters,
  INotificationsPage,
} from '../interfaces/notification.interfaces'

interface INotificationRow {
  id: string
  userId: string
  projectId: string
  type: NotificationType
  title: string
  body: string
  url: string | null
  flagKey: string | null
  readAt: Date | null
  createdAt: Date
  project: { name: string }
}

function toINotification(row: INotificationRow): INotification {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId,
    projectName: row.project.name,
    type: row.type,
    title: row.title,
    body: row.body,
    url: row.url,
    flagKey: row.flagKey,
    readAt: row.readAt,
    createdAt: row.createdAt,
  }
}

@Injectable()
export class NotificationRepository extends INotificationRepository {
  findById = async (id: string, tx: TxClient): Promise<INotification | null> => {
    const row = await tx.notification.findFirst({
      where: { id },
      include: { project: { select: { name: true } } },
    })
    if (!row) return null
    return toINotification(row)
  }

  createMany = async (data: ICreateNotificationData[], tx: TxClient): Promise<INotification[]> => {
    if (data.length === 0) return []
    const rows = await tx.notification.createManyAndReturn({
      data: data.map((item) => ({
        userId: item.userId,
        projectId: item.projectId,
        type: item.type,
        title: item.title,
        body: item.body,
        url: item.url,
        flagKey: item.flagKey,
      })),
      include: { project: { select: { name: true } } },
    })
    return rows.map(toINotification)
  }

  findPageForUser = async (
    filters: INotificationsPageFilters,
    tx: TxClient,
  ): Promise<INotificationsPage> => {
    const where = {
      userId: filters.userId,
      ...(filters.projectId !== undefined && { projectId: filters.projectId }),
    }

    const [rows, totalCount] = await Promise.all([
      tx.notification.findMany({
        where,
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: 'desc' as const },
        take: filters.limit,
        skip: filters.offset,
      }),
      tx.notification.count({ where }),
    ])

    return {
      items: rows.map(toINotification),
      totalCount,
      hasMore: filters.offset + rows.length < totalCount,
    }
  }

  countUnread = async (userId: string, tx: TxClient): Promise<number> => {
    return tx.notification.count({ where: { userId, readAt: null } })
  }

  markRead = async (id: string, userId: string, tx: TxClient): Promise<void> => {
    await tx.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } })
  }

  markAllRead = async (userId: string, tx: TxClient): Promise<void> => {
    await tx.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } })
  }

  deleteAllForUser = async (userId: string, tx: TxClient): Promise<number> => {
    const result = await tx.notification.deleteMany({ where: { userId } })
    return result.count
  }
}
