import { gql } from "@apollo/client";

export const LIST_SALE_ORDER_DETAIL = gql`
  query ListSaleOrder($saleOrderId: String!) {
    listSaleOrderDetail(saleOrderId: $saleOrderId) {
      _id
      product {
        _id
        code
        name
        stock_type
      }
      sale_order {
        _id
        total
      }
      sale_price
      quantity
      serials
      subtotal
    }
  }
`;

export const LIST_SERIAL_BY_SALE_ORDER_DETAIL = gql`
query Query($saleOrderDetailId: String!) {
  listProductSerialBySaleOrder(saleOrderDetailId: $saleOrderDetailId) {
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
