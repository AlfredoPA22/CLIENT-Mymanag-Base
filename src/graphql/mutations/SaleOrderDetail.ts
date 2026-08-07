import { gql } from "@apollo/client";

export const CREATE_SALE_ORDER_DETAIL = gql`
  mutation CreateSaleOrderDetail(
    $product: String!
    $sale_order: String!
    $sale_price: Float!
    $quantity: Int!
    $warehouse: String
    $discount_type: String
    $discount_value: Float
  ) {
    createSaleOrderDetail(
      saleOrderDetailInput: {
        product: $product
        sale_order: $sale_order
        sale_price: $sale_price
        quantity: $quantity
        warehouse: $warehouse
        discount_type: $discount_type
        discount_value: $discount_value
      }
    ) {
      _id
      sale_order {
        _id
        code
        client {
          _id
          code
          fullName
          phoneNumber
        }
        date
        status
        total
        payment_method
        contado_payment_method
        is_paid
        has_return
        discount_type
        discount_value
        discount_amount
        source
        currency
        exchange_rate
      }
    }
  }
`;

export const CREATE_CUSTOM_SALE_ORDER_DETAIL = gql`
  mutation CreateCustomSaleOrderDetail(
    $sale_order: String!
    $name: String!
    $sale_price: Float!
    $quantity: Int!
    $cost: Float
    $discount_type: String
    $discount_value: Float
  ) {
    createCustomSaleOrderDetail(
      createCustomSaleOrderDetailInput: {
        sale_order: $sale_order
        name: $name
        sale_price: $sale_price
        quantity: $quantity
        cost: $cost
        discount_type: $discount_type
        discount_value: $discount_value
      }
    ) {
      _id
      sale_order {
        _id
        code
        client {
          _id
          code
          fullName
          phoneNumber
        }
        date
        status
        total
        payment_method
        contado_payment_method
        is_paid
        has_return
        discount_type
        discount_value
        discount_amount
        source
        currency
        exchange_rate
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
    $discount_type: String
    $discount_value: Float
  ) {
    updateSaleOrderDetail(
      updateSaleOrderDetailInput: {
        sale_price: $sale_price
        quantity: $quantity
        discount_type: $discount_type
        discount_value: $discount_value
      }
      saleOrderDetailId: $saleOrderDetailId
    ) {
      _id
      discount_type
      discount_value
      discount_amount
      subtotal
    }
  }
`;

export const ADD_MANY_SERIALS_TO_SALE_ORDER_DETAIL = gql`
  mutation AddManySerialsToSaleOrderDetail(
    $addManySerialsToSaleOrderDetailInput: AddManySerialsToSaleOrderDetailInput!
  ) {
    addManySerialsToSaleOrderDetail(
      addManySerialsToSaleOrderDetailInput: $addManySerialsToSaleOrderDetailInput
    ) {
      _id
      serial
      status
    }
  }
`;