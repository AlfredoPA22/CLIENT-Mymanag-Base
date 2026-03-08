import { gql } from "@apollo/client";

export const LIST_PRODUCT_TRANSFER = gql`
  query ListProductTransfer {
    listProductTransfer {
      _id
      code
      date
      status
      origin_warehouse {
        _id
        name
      }
      destination_warehouse {
        _id
        name
      }
      created_by {
        _id
        user_name
      }
    }
  }
`;

export const FIND_PRODUCT_TRANSFER = gql`
  query FindProductTransfer($transferId: String!) {
    findProductTransfer(transferId: $transferId) {
      _id
      code
      date
      status
      origin_warehouse {
        _id
        name
      }
      destination_warehouse {
        _id
        name
      }
      created_by {
        _id
        user_name
      }
    }
  }
`;

export const LIST_PRODUCT_TRANSFER_DETAIL = gql`
  query ListProductTransferDetail($transferId: String!) {
    listProductTransferDetail(transferId: $transferId) {
      _id
      quantity
      serials
      product {
        _id
        code
        name
        stock_type
        stock
      }
    }
  }
`;
