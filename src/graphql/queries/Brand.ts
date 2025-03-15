import { gql } from "@apollo/client";

export const LIST_BRAND = gql`
  query {
    listBrand{
      _id
      name
      description
      count_product
      is_active
    }
  }
`;
