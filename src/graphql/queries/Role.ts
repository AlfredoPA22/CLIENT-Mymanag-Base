import { gql } from "@apollo/client";

export const LIST_ROLE = gql`
  query ListRole {
    listRole {
      _id
      description
      name
      permission
    }
  }
`;

export const LIST_PERMISSIONS_BY_ROLE = gql`
  query ListPermissionsByRole($roleId: String!) {
    listPermissionsByRole(roleId: $roleId)
  }
`;
