import { gql } from "@apollo/client";

export const CREATE_PRODUCT_TRANSFER = gql`
  mutation Mutation(
    $date: String!
    $destination_warehouse: String!
    $origin_warehouse: String!
  ) {
    createProductTransfer(
      productTransferInput: {
        date: $date
        destination_warehouse: $destination_warehouse
        origin_warehouse: $origin_warehouse
      }
    ) {
      _id
      code
      created_by {
        _id
        user_name
      }
      date
      destination_warehouse {
        _id
        name
      }
      origin_warehouse {
        _id
        name
      }
      status
    }
  }
`;
