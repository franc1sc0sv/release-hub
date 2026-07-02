import type { INotificationPayload } from '../interfaces/notification.interfaces'

export function formatNotificationMessage(payload: INotificationPayload): string {
  const lines = [`*${payload.title}*`, ...payload.bodyLines]
  if (payload.url) lines.push(payload.url)
  return lines.join('\n')
}
