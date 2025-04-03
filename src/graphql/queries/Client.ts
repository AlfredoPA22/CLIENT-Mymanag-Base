import { gql } from "@apollo/client";

export const LIST_CLIENT = gql`
  query ListClient {
    listClient {
      _id
      code
      fullName
      email
      address
      phoneNumber
    }
  }
`;

export const LIST_SALE_ORDER_BY_CLIENT = gql`
  query ListSaleOrderByClient($clientId: String!) {
    listSaleOrderByClient(clientId: $clientId) {
      saleOrder {
        _id
        code
        date
        status
        total
      }
      total
    }
  }
`;
