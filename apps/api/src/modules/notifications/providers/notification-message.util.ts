import { NotificationType } from '../../../common/types/notification-type.enum'
import type { INotificationPayload } from '../interfaces/notification.interfaces'

export function formatNotificationMessage(payload: INotificationPayload): string {
  const lines = [`*${payload.title}*`, ...payload.bodyLines]
  if (payload.url) lines.push(payload.url)
  return lines.join('\n')
}

export interface INotificationMessageContext {
  releaseName?: string
  flagKey?: string
  environmentName?: string
  previousValue?: string
  newValue?: string
  staleDays?: number
}

export interface INotificationMessageContent {
  title: string
  body: string
  url: string | null
}

function flagUrl(flagKey: string | undefined): string | null {
  return flagKey ? `/flags/${flagKey}` : null
}

export function buildNotificationMessage(
  type: NotificationType,
  context: INotificationMessageContext,
): INotificationMessageContent {
  switch (type) {
    case NotificationType.RELEASE_CREATED:
      return {
        title: `New release draft: ${context.releaseName ?? 'untitled'}`,
        body: 'A new release draft was created for this project.',
        url: null,
      }
    case NotificationType.RELEASE_SHIPPED:
      return {
        title: `Release shipped: ${context.releaseName ?? 'release'}`,
        body: 'The release was shipped.',
        url: null,
      }
    case NotificationType.RELEASE_DEPLOYED:
      return {
        title: `Release deployed: ${context.releaseName ?? 'release'}`,
        body: 'The release has been deployed.',
        url: null,
      }
    case NotificationType.FLAG_IN_PROGRESS_REMINDER:
      return {
        title: `Flag still in progress: ${context.flagKey ?? ''}`,
        body: `The flag ${context.flagKey ?? ''} has been in progress for a while.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_STALENESS_ALERT:
      return {
        title: `Stale flag: ${context.flagKey ?? ''}`,
        body: `The flag ${context.flagKey ?? ''} has been in progress for more than ${context.staleDays ?? 0} days.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_DIGEST:
      return {
        title: 'Flag digest',
        body: 'Your scheduled flag digest is ready.',
        url: null,
      }
    case NotificationType.FLAG_CREATED:
      return {
        title: `Flag created: ${context.flagKey ?? ''}`,
        body: `A new flag ${context.flagKey ?? ''} was detected in the codebase.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_DELETED:
      return {
        title: `Flag deleted: ${context.flagKey ?? ''}`,
        body: `The flag ${context.flagKey ?? ''} was removed from the codebase.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_ENABLED:
      return {
        title: `Flag enabled: ${context.flagKey ?? ''}`,
        body: `The flag ${context.flagKey ?? ''} was enabled${context.environmentName ? ` in ${context.environmentName}` : ''}.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_DISABLED:
      return {
        title: `Flag disabled: ${context.flagKey ?? ''}`,
        body: `The flag ${context.flagKey ?? ''} was disabled${context.environmentName ? ` in ${context.environmentName}` : ''}.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_VALUE_CHANGED:
      return {
        title: `Flag value changed: ${context.flagKey ?? ''}`,
        body: `The flag ${context.flagKey ?? ''} value changed from ${context.previousValue ?? 'unset'} to ${context.newValue ?? 'unset'}.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_CONFLICT:
      return {
        title: `Flag conflict: ${context.flagKey ?? ''}`,
        body: `Flag ${context.flagKey ?? ''} was disabled in ${context.environmentName ?? 'an environment'}, but it is marked as shipped-on in ${context.releaseName ?? 'the release'}.`,
        url: flagUrl(context.flagKey),
      }
    case NotificationType.FLAG_SHIP_OFF_REMINDER:
      return {
        title: `Ship-off reminder: ${context.flagKey ?? ''}`,
        body: `The flag ${context.flagKey ?? ''} was decided to ship off but is still disabled. Remove it from the codebase.`,
        url: flagUrl(context.flagKey),
      }
  }
}
