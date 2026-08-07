import { gql } from "@apollo/client";

export const OPEN_CASH_REGISTER = gql`
  mutation OpenCashRegister(
    $opening_amount: Float!
    $opening_amount_bs: Float
    $notes: String
  ) {
    openCashRegister(
      openCashRegisterInput: {
        opening_amount: $opening_amount
        opening_amount_bs: $opening_amount_bs
        notes: $notes
      }
    ) {
      _id
    }
  }
`;

export const CLOSE_CASH_REGISTER = gql`
  mutation CloseCashRegister(
    $cashRegisterId: String!
    $closing_amount: Float!
    $closing_amount_bs: Float
    $notes: String
  ) {
    closeCashRegister(
      cashRegisterId: $cashRegisterId
      closeCashRegisterInput: {
        closing_amount: $closing_amount
        closing_amount_bs: $closing_amount_bs
        notes: $notes
      }
    ) {
      _id
    }
  }
`;

export const ADD_CASH_MOVEMENT = gql`
  mutation AddCashMovement(
    $cashRegisterId: String!
    $type: String!
    $amount: Float!
    $currency: String
    $description: String!
  ) {
    addCashMovement(
      cashRegisterId: $cashRegisterId
      addCashMovementInput: {
        type: $type
        amount: $amount
        currency: $currency
        description: $description
      }
    ) {
      _id
    }
  }
`;
