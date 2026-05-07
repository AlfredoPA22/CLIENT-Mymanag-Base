import { gql } from "@apollo/client";

export const LIST_SALE_RETURN = gql`
  query ListSaleReturn {
    listSaleReturn {
      _id
      code
      date
      reason
      total
      sale_order {
        _id
        code
        client {
          fullName
        }
      }
      created_by {
        user_name
      }
    }
  }
`;

export const FIND_SALE_RETURN_BY_SALE_ORDER = gql`
  query FindSaleReturnBySaleOrder($saleOrderId: String!) {
    findSaleReturnBySaleOrder(saleOrderId: $saleOrderId) {
      _id
      code
      date
      reason
      total
    }
  }
`;

export const LIST_SALE_RETURN_DETAIL = gql`
  query ListSaleReturnDetail($saleReturnId: String!) {
    listSaleReturnDetail(saleReturnId: $saleReturnId) {
      _id
      product {
        _id
        code
        name
      }
      quantity
      sale_price
      subtotal
    }
  }
`;
