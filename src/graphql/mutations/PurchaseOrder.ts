import { gql } from "@apollo/client";

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($date: String!, $provider: String!) {
    createPurchaseOrder(
      purchaseOrderInput: { date: $date, provider: $provider }
    ) {
      _id
      code
      date
      provider {
        _id
        code
        name
      }
      status
      total
    }
  }
`;

export const DELETE_PURCHASE_ORDER = gql`
  mutation DeletePurchaseOrder($purchaseOrderId: String!) {
    deletePurchaseOrder(purchaseOrderId: $purchaseOrderId) {
      success
    }
  }
`;

export const APPROVE_PURCHASE_ORDER = gql`
  mutation ApprovePurchaseOrder($purchaseOrderId: String!) {
    approvePurchaseOrder(purchaseOrderId: $purchaseOrderId) {
      _id
      code
      date
      status
      total
    }
  }
`;
