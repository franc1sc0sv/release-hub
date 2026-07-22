import { Injectable } from '@nestjs/common'
import { IDatabaseService } from '../../../common/database/database.abstract'
import type { TxClient } from '@release-hub/db'
import { NotificationChannel } from '../../../common/types/notification-channel.enum'
import { NotificationType } from '../../../common/types/notification-type.enum'
import { DigestFrequency } from '../../../common/types/digest-frequency.enum'
import { INotificationReadRepository } from '../interfaces/notification-read.repository'
import { INotificationPreferenceRepository } from '../interfaces/notification-preference.repository'
import { INotificationRepository } from '../interfaces/notification.repository'
import { buildInAppNotificationUrl } from '../providers/notification-message.util'
import { EmailNotificationProvider } from '../providers/email-notification.provider'
import { SlackDmProvider } from '../providers/slack-dm.provider'
import { SlackChannelProvider } from '../providers/slack-channel.provider'
import type {
  INotificationPayload,
  IProjectMemberForNotification,
  IUserNotificationPreference,
} from '../interfaces/notification.interfaces'

const DEFAULT_ENABLED = true
const DEFAULT_DIGEST_FREQUENCY: DigestFrequency = DigestFrequency.WEEKLY

const RELEASE_EVENT_TYPES: NotificationType[] = [
  NotificationType.RELEASE_CREATED,
  NotificationType.RELEASE_SHIPPED,
  NotificationType.RELEASE_DEPLOYED,
]

function resolvePreference(
  preferences: IUserNotificationPreference[],
  type: NotificationType,
  channel: NotificationChannel,
): { enabled: boolean; digestFrequency: DigestFrequency } {
  const match = preferences.find((pref) => pref.notificationType === type && pref.channel === channel)
  if (!match) return { enabled: DEFAULT_ENABLED, digestFrequency: DEFAULT_DIGEST_FREQUENCY }
  return {
    enabled: match.enabled,
    digestFrequency: match.digestFrequency ?? DEFAULT_DIGEST_FREQUENCY,
  }
}

@Injectable()
export class NotificationDispatcherService {
  constructor(
    private readonly db: IDatabaseService,
    private readonly notificationReadRepository: INotificationReadRepository,
    private readonly notificationPreferenceRepository: INotificationPreferenceRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly slackDmProvider: SlackDmProvider,
    private readonly slackChannelProvider: SlackChannelProvider,
  ) {}

  async dispatchToProjectMembers(
    projectId: string,
    type: NotificationType,
    payload: INotificationPayload,
  ): Promise<void> {
    const { members, preferences, organizationId } = await this.db.$transaction(async (tx: TxClient) => {
      const projectMembers = await this.notificationReadRepository.findMembersForProject(projectId, tx)
      const memberPreferences = await this.notificationPreferenceRepository.findAllForUsersAndProject(
        projectMembers.map((member) => member.userId),
        projectId,
        tx,
      )
      const projectOrganizationId = await this.notificationReadRepository.findProjectOrganizationId(projectId, tx)
      return { members: projectMembers, preferences: memberPreferences, organizationId: projectOrganizationId }
    })

    await Promise.all(members.map((member) => this.dispatchToMember(member, preferences, type, payload)))

    const inAppRecipients = members.filter((member) => {
      const memberPreferences = preferences.filter((pref) => pref.userId === member.userId)
      return resolvePreference(memberPreferences, type, NotificationChannel.IN_APP).enabled
    })

    if (inAppRecipients.length > 0) {
      const inAppUrl = buildInAppNotificationUrl(
        type,
        organizationId,
        payload.projectId,
        payload.flagKey,
        payload.releaseId,
      )
      await this.db.$transaction((tx) =>
        this.notificationRepository.createMany(
          inAppRecipients.map((member) => ({
            userId: member.userId,
            projectId: payload.projectId,
            type,
            title: payload.title,
            body: payload.bodyLines.join('\n'),
            url: inAppUrl,
            flagKey: payload.flagKey,
          })),
          tx,
        ),
      )
    }
  }

  private async dispatchToMember(
    member: IProjectMemberForNotification,
    preferences: IUserNotificationPreference[],
    type: NotificationType,
    payload: INotificationPayload,
  ): Promise<void> {
    const memberPreferences = preferences.filter((pref) => pref.userId === member.userId)

    const emailPreference = resolvePreference(memberPreferences, type, NotificationChannel.EMAIL)
    if (emailPreference.enabled) {
      await this.emailProvider.send(
        { userId: member.userId, email: member.email, slackChannelId: null, projectId: payload.projectId },
        payload,
      )
    }

    const slackDmPreference = resolvePreference(memberPreferences, type, NotificationChannel.SLACK_DM)
    if (slackDmPreference.enabled) {
      await this.slackDmProvider.send(
        { userId: member.userId, email: member.email, slackChannelId: null, projectId: payload.projectId },
        payload,
      )
    }
  }

  async dispatchToProjectChannel(
    projectId: string,
    type: NotificationType,
    payload: INotificationPayload,
  ): Promise<void> {
    if (!RELEASE_EVENT_TYPES.includes(type)) return

    const connection = await this.db.$transaction((tx) =>
      this.notificationReadRepository.findSlackConnectionForProject(projectId, tx),
    )
    if (!connection) return

    const gate: Record<NotificationType, boolean> = {
      [NotificationType.RELEASE_CREATED]: connection.notifyOnCreated,
      [NotificationType.RELEASE_SHIPPED]: connection.notifyOnShipped,
      [NotificationType.RELEASE_DEPLOYED]: connection.notifyOnDeployed,
      [NotificationType.FLAG_IN_PROGRESS_REMINDER]: false,
      [NotificationType.FLAG_STALENESS_ALERT]: false,
      [NotificationType.FLAG_DIGEST]: false,
      [NotificationType.FLAG_CREATED]: false,
      [NotificationType.FLAG_DELETED]: false,
      [NotificationType.FLAG_ENABLED]: false,
      [NotificationType.FLAG_DISABLED]: false,
      [NotificationType.FLAG_VALUE_CHANGED]: false,
      [NotificationType.FLAG_CONFLICT]: false,
      [NotificationType.FLAG_SHIP_OFF_REMINDER]: false,
    }
    if (!gate[type]) return

    await this.slackChannelProvider.send(
      { userId: null, email: null, slackChannelId: connection.channelId, projectId },
      payload,
    )
  }

  async dispatchDigestToMember(
    member: IProjectMemberForNotification,
    frequency: DigestFrequency,
    payload: INotificationPayload,
  ): Promise<void> {
    const preferences = await this.db.$transaction((tx) =>
      this.notificationPreferenceRepository.findAllForUserAndProject(member.userId, payload.projectId, tx),
    )

    const emailPreference = resolvePreference(preferences, NotificationType.FLAG_DIGEST, NotificationChannel.EMAIL)
    if (emailPreference.enabled && emailPreference.digestFrequency === frequency) {
      await this.emailProvider.send(
        { userId: member.userId, email: member.email, slackChannelId: null, projectId: payload.projectId },
        payload,
      )
    }

    const slackDmPreference = resolvePreference(
      preferences,
      NotificationType.FLAG_DIGEST,
      NotificationChannel.SLACK_DM,
    )
    if (slackDmPreference.enabled && slackDmPreference.digestFrequency === frequency) {
      await this.slackDmProvider.send(
        { userId: member.userId, email: member.email, slackChannelId: null, projectId: payload.projectId },
        payload,
      )
    }
  }
}
