import { gql } from "@apollo/client";

export const CREATE_SALE_ORDER_DETAIL = gql`
  mutation CreateSaleOrderDetail(
    $product: String!
    $sale_order: String!
    $sale_price: Float!
    $quantity: Int!
  ) {
    createSaleOrderDetail(
      saleOrderDetailInput: {
        product: $product
        sale_order: $sale_order
        sale_price: $sale_price
        quantity: $quantity
      }
    ) {
      _id
      sale_order {
        total
        status
        client {
          _id
          code
          firstName
          lastName
          phoneNumber
        }
        date
        code
        _id
      }
    }
  }
`;

export const ADD_SERIAL_TO_SALE_ORDER_DETAIL = gql`
  mutation Mutation($sale_order_detail: String!, $serial: String!) {
    addSerialToSaleOrderDetail(
      addSerialToSaleOrderDetailInput: {
        sale_order_detail: $sale_order_detail
        serial: $serial
      }
    ) {
      _id
    }
  }
`;

export const DELETE_SERIAL_TO_SALE_ORDER_DETAIL = gql`
  mutation DeleteSerialToSaleOrderDetail($productSerialId: String!) {
    deleteSerialToSaleOrderDetail(productSerialId: $productSerialId) {
      success
    }
  }
`;

export const DELETE_PRODUCT_TO_SALE_ORDER_DETAIL = gql`
  mutation DeleteProductToSaleOrderDetail($saleOrderDetailId: String!) {
    deleteProductToSaleOrderDetail(saleOrderDetailId: $saleOrderDetailId) {
      success
    }
  }
`;

export const UPDATE_SALE_ORDER_DETAIL = gql`
  mutation UpdateSaleOrderDetail(
    $sale_price: Float!
    $quantity: Int!
    $saleOrderDetailId: String!
  ) {
    updateSaleOrderDetail(
      updateSaleOrderDetailInput: {
        sale_price: $sale_price
        quantity: $quantity
      }
      saleOrderDetailId: $saleOrderDetailId
    ) {
      _id
    }
  }
`;

