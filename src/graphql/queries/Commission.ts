import { gql } from "@apollo/client";

export const LIST_COMMISSIONS = gql`
  query ListCommissions($filter: CommissionFilterInput) {
    listCommissions(filter: $filter) {
      _id
      rate
      amount
      status
      paid_at
      createdAt
      seller {
        _id
        user_name
      }
      paid_by {
        _id
        user_name
      }
      sale_order {
        _id
        code
        date
        total
        currency
        exchange_rate
        client {
          fullName
        }
      }
    }
  }
`;
