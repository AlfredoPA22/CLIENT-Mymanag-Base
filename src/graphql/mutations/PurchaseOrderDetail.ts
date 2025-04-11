import { gql } from "@apollo/client";

export const CREATE_PURCHASE_ORDER_DETAIL = gql`
  mutation CreatePurchaseOrderDetail(
    $product: String!
    $purchase_order: String!
    $purchase_price: Float!
    $quantity: Int!
    $warehouse: String
  ) {
    createPurchaseOrderDetail(
      purchaseOrderDetailInput: {
        product: $product
        purchase_order: $purchase_order
        purchase_price: $purchase_price
        quantity: $quantity
        warehouse: $warehouse
      }
    ) {
      _id
      purchase_order {
        total
        status
        date
        code
        _id
      }
    }
  }
`;

export const ADD_SERIAL_TO_PURCHASE_ORDER_DETAIL = gql`
  mutation Mutation(
    $purchase_order_detail: String!
    $serial: String!
    $warehouse: String!
  ) {
    addSerialToPurchaseOrderDetail(
      addSerialToPurchaseOrderDetailInput: {
        purchase_order_detail: $purchase_order_detail
        serial: $serial
        warehouse: $warehouse
      }
    ) {
      _id
    }
  }
`;

export const DELETE_SERIAL_TO_PURCHASE_ORDER_DETAIL = gql`
  mutation DeleteSerialToPurchaseOrderDetail($productSerialId: String!) {
    deleteSerialToPurchaseOrderDetail(productSerialId: $productSerialId) {
      success
    }
  }
`;

export const DELETE_PRODUCT_TO_PURCHASE_ORDER_DETAIL = gql`
  mutation DeleteProductToPurchaseOrderDetail($purchaseOrderDetailId: String!) {
    deleteProductToPurchaseOrderDetail(
      purchaseOrderDetailId: $purchaseOrderDetailId
    ) {
      success
    }
  }
`;

export const UPDATE_PURCHASE_ORDER_DETAIL = gql`
  mutation UpdatePurchaseOrderDetail(
    $purchase_price: Float!
    $quantity: Int!
    $purchaseOrderDetailId: String!
  ) {
    updatePurchaseOrderDetail(
      updatePurchaseOrderDetailInput: {
        purchase_price: $purchase_price
        quantity: $quantity
      }
      purchaseOrderDetailId: $purchaseOrderDetailId
    ) {
      _id
    }
  }
`;
