import { gql } from "@apollo/client";

export const LIST_CATEGORY = gql`
  query {
    listCategory {
      _id
      name
      description
      count_product
      is_active
    }
  }
`;
