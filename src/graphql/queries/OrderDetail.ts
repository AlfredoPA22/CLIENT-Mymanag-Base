import { gql } from "@apollo/client";

export const LIST_ORDER_DETAIL = gql`
  query listOrderDetailByOrder($id_order: String!) {
    listOrderDetailByOrder(id_order: $id_order) {
      _id
      detail
      discount
      food {
        name
        image
        code
        category{
          name
        }
      }
      nro
      order {
        code
      }
      quantity
      sale_price
      status
      subtotal
    }
  }
`;
