import { gql } from "@apollo/client";

export const CREATE_ROLE = gql`
  mutation Mutation(
    $name: String!
    $description: String
    $permission: [String!]!
  ) {
    createRole(
      roleInput: {
        name: $name
        description: $description
        permission: $permission
      }
    ) {
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
