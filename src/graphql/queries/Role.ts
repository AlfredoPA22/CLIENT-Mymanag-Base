import { gql } from "@apollo/client";

export const LIST_ROLE = gql`
  query ListRole {
    listRole {
      _id
      description
      name
      permission {
        name
        value
      }
    }
  }
`;
