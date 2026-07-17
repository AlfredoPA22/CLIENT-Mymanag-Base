import { gql } from "@apollo/client";

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      _id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation {
    markAllNotificationsRead {
      success
    }
  }
`;
