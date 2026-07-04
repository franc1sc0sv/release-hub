import { graphql } from '@/generated/gql'

export const MARK_NOTIFICATION_READ = graphql(`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`)

export const MARK_ALL_NOTIFICATIONS_READ = graphql(`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`)
