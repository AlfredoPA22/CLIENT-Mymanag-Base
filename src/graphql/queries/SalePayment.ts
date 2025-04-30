import { gql } from "@apollo/client";

export const LIST_SALE_PAYMENT_BY_SALE_ORDER = gql`
  query ListSalePaymentBySaleOrder($saleOrderId: String!) {
    listSalePaymentBySaleOrder(saleOrderId: $saleOrderId) {
      _id
      amount
      date
      note
      payment_method
      sale_order {
        _id
        is_paid
        code
        status
        total
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

export const DETAIL_SALE_PAYMENT_BY_SALE_ORDER = gql`
  query DetailSalePaymentBySaleOrder($saleOrderId: String!) {
    detailSalePaymentBySaleOrder(saleOrderId: $saleOrderId) {
      sale_order {
        _id
        is_paid
        code
        status
        client{
          fullName
        }
      }
      total_amount
      total_paid
      total_pending
    }
  }
`;
