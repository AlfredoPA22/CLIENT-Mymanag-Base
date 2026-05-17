import { gql } from "@apollo/client";

export const LIST_KARDEX_BY_PRODUCT = gql`
  query ListKardexByProduct($productId: String!) {
    listKardexByProduct(productId: $productId) {
      _id
      date
      type
      reference_code
      reference_id
      quantity
      unit_price
      subtotal
      balance
      created_by
      entity_name
    }
  }
`;
