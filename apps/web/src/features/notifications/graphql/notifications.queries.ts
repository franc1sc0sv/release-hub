import { graphql } from '@/generated/gql'

export const NOTIFICATIONS = graphql(`
  query Notifications($input: NotificationsPageInput!) {
    notifications(input: $input) {
      totalCount
      hasMore
      items {
        id
        projectId
        projectName
        type
        title
        body
        url
        flagKey
        readAt
        createdAt
      }
    }
  }
`)

export const UNREAD_NOTIFICATIONS_COUNT = graphql(`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`)

export const NOTIFICATION_RECEIVED = graphql(`
  subscription NotificationReceived($projectId: ID) {
    notificationReceived(projectId: $projectId) {
      id
      projectId
      projectName
      type
      title
      body
      url
      flagKey
      readAt
      createdAt
    }
  }
`)
