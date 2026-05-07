import { gql } from "@apollo/client";

export const CREATE_SALE_RETURN = gql`
  mutation CreateSaleReturn(
    $saleOrderId: String!
    $reason: String!
    $items: [SaleReturnItemInput!]!
  ) {
    createSaleReturn(saleOrderId: $saleOrderId, reason: $reason, items: $items) {
      _id
      code
      date
      reason
      total
      sale_order {
        _id
        code
      }
    }
  }
`;
