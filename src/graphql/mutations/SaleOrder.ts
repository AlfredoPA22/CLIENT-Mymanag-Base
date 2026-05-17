import { gql } from "@apollo/client";

export const CREATE_SALE_ORDER = gql`
  mutation CreateSaleOrder(
    $date: String!
    $client: String!
    $payment_method: String!
    $contado_payment_method: String
  ) {
    createSaleOrder(
      saleOrderInput: {
        date: $date
        client: $client
        payment_method: $payment_method
        contado_payment_method: $contado_payment_method
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

export const UPDATE_SALE_ORDER_DISCOUNT = gql`
  mutation UpdateSaleOrderDiscount(
    $saleOrderId: String!
    $discount_type: String
    $discount_value: Float
  ) {
    updateSaleOrderDiscount(
      saleOrderId: $saleOrderId
      updateSaleOrderDiscountInput: {
        discount_type: $discount_type
        discount_value: $discount_value
      }
    ) {
      _id
      total
      discount_type
      discount_value
      discount_amount
    }
  }
`;
