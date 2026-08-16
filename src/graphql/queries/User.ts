import { gql } from "@apollo/client";

export const LIST_USER = gql`
  query ListUser {
    listUser {
      _id
      user_name
      is_active
      is_global
      commission_rate
      role {
        _id
        description
        name
        permission
      }
    }
  }
`;
