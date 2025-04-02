import { gql } from "@apollo/client";

export const LIST_PERMISSION = gql`
  query ListPermission {
    listPermission {
      label
      name
      value
      children {
        label
        name
        value
      }
    }
  }
`;
