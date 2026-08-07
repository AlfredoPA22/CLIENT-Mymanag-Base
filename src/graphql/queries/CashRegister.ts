import { gql } from "@apollo/client";

const CASH_REGISTER_FIELDS = `
  _id
  status
  opening_amount
  opening_amount_bs
  opening_date
  opened_by {
    _id
    user_name
  }
  closing_amount
  closing_amount_bs
  closing_date
  closed_by {
    _id
    user_name
  }
  notes
  movements {
    type
    amount
    currency
    description
    date
    created_by {
      _id
      user_name
    }
  }
  cash_sales
  cash_sales_bs
  cash_payments
  cash_payments_bs
  expected_amount
  expected_amount_bs
`;

export const FIND_CURRENT_CASH_REGISTER = gql`
  query FindCurrentCashRegister {
    findCurrentCashRegister {
      ${CASH_REGISTER_FIELDS}
    }
  }
`;

export const LIST_CASH_REGISTER = gql`
  query ListCashRegister {
    listCashRegister {
      ${CASH_REGISTER_FIELDS}
    }
  }
`;
