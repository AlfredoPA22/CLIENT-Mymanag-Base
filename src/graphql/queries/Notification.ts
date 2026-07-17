import { gql } from "@apollo/client";

export const LIST_NOTIFICATIONS = gql`
  query {
    listNotifications {
      _id
      type
      title
      message
      link
      read
      createdAt
    }
  }
`;

export const COUNT_UNREAD_NOTIFICATIONS = gql`
  query {
    countUnreadNotifications
  }
`;
