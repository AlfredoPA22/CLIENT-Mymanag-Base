import { gql } from "@apollo/client";

export const CREATE_PRODUCT_TRANSFER = gql`
  mutation CreateProductTransfer(
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

export const CREATE_PRODUCT_TRANSFER_DETAIL = gql`
  mutation CreateProductTransferDetail(
    $product_transfer: String!
    $product: String!
    $quantity: Int!
  ) {
    createProductTransferDetail(
      productTransferDetailInput: {
        product_transfer: $product_transfer
        product: $product
        quantity: $quantity
      }
    ) {
      _id
      quantity
      serials
      product {
        _id
        name
        stock_type
      }
    }
  }
`;

export const ADD_SERIAL_TO_TRANSFER_DETAIL = gql`
  mutation AddSerialToTransferDetail(
    $product_transfer_detail: String!
    $serial: String!
  ) {
    addSerialToTransferDetail(
      addSerialToTransferDetailInput: {
        product_transfer_detail: $product_transfer_detail
        serial: $serial
      }
    ) {
      _id
      serial
      status
    }
  }
`;

export const REMOVE_SERIAL_FROM_TRANSFER_DETAIL = gql`
  mutation RemoveSerialFromTransferDetail(
    $transferDetailId: String!
    $serial: String!
  ) {
    removeSerialFromTransferDetail(
      transferDetailId: $transferDetailId
      serial: $serial
    ) {
      success
    }
  }
`;

export const DELETE_PRODUCT_FROM_TRANSFER = gql`
  mutation DeleteProductFromTransfer($transferDetailId: String!) {
    deleteProductFromTransfer(transferDetailId: $transferDetailId) {
      success
    }
  }
`;

export const DELETE_PRODUCT_TRANSFER = gql`
  mutation DeleteProductTransfer($transferId: String!) {
    deleteProductTransfer(transferId: $transferId) {
      success
    }
  }
`;

export const APPROVE_PRODUCT_TRANSFER = gql`
  mutation ApproveProductTransfer($transferId: String!) {
    approveProductTransfer(transferId: $transferId) {
      _id
      code
      status
    }
  }
`;
