import { gql } from "@apollo/client";

export const CREATE_SALE_PAYMENT = gql`
  mutation CreateSalePayment(
    $amount: Float!
    $date: String!
    $note: String
    $payment_method: String!
    $sale_order: String!
  ) {
    createSalePayment(
      salePaymentInput: {
        amount: $amount
        date: $date
        note: $note
        payment_method: $payment_method
        sale_order: $sale_order
      }
    ) {
      _id
      amount
      created_by {
        _id
        user_name
      }
      date
      note
      payment_method
      sale_order {
        _id
      }
    }
  }
`;

export const DELETE_SALE_PAYMENT = gql`
  mutation DeleteSalePayment($salePaymentId: String!) {
    deleteSalePayment(salePaymentId: $salePaymentId) {
      success
    }
  }
`;
