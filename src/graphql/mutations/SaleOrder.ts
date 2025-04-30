import { gql } from "@apollo/client";

export const CREATE_SALE_ORDER = gql`
  mutation CreateSaleOrder(
    $date: String!
    $client: String!
    $payment_method: String!
  ) {
    createSaleOrder(
      saleOrderInput: {
        date: $date
        client: $client
        payment_method: $payment_method
      }
    ) {
      _id
      code
      date
      status
      total
    }
  }
`;

export const DELETE_SALE_ORDER = gql`
  mutation DeleteSaleOrder($saleOrderId: String!) {
    deleteSaleOrder(saleOrderId: $saleOrderId) {
      success
    }
  }
`;

export const APPROVE_SALE_ORDER = gql`
  mutation ApproveSaleOrder($saleOrderId: String!) {
    approveSaleOrder(saleOrderId: $saleOrderId) {
      _id
      code
      date
      status
      total
    }
  }
`;
