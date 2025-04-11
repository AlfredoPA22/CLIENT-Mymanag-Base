import { gql } from "@apollo/client";

export const LIST_PURCHASE_ORDER_DETAIL = gql`
  query ListPurchaseOrder($purchaseOrderId: String!) {
    listPurchaseOrderDetail(purchaseOrderId: $purchaseOrderId) {
      _id
      product {
        _id
        name
        stock_type
      }
      purchase_order {
        _id
        total
      }
      purchase_price
      quantity
      serials
      subtotal
    }
  }
`;

export const LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL = gql`
query Query($purchaseOrderDetailId: String!) {
  listProductSerialByPurchaseOrder(purchaseOrderDetailId: $purchaseOrderDetailId) {
    _id
    serial
    status
    warehouse{
      _id
      name
    }
  }
}
`;
