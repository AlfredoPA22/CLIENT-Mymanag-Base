import { gql } from "@apollo/client";

export const LIST_WAREHOUSE = gql`
  query ListWarehouse {
    listWarehouse {
      _id
      description
      is_active
      name
    }
  }
`;
