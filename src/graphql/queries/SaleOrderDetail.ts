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
      custom_name
      custom_cost
      sale_order {
        _id
        total
        currency
        exchange_rate
      }
      sale_price
      quantity
      serials
      discount_type
      discount_value
      discount_amount
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
