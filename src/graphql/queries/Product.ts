import { gql } from "@apollo/client";

export const LIST_PRODUCT = gql`
  query {
    listProduct {
      _id
      brand {
        _id
        name
      }
      category {
        _id
        name
      }
      code
      description
      last_cost_price
      name
      sale_price
      status
      stock
      stock_type
    }
  }
`;

export const LIST_PRODUCT_SELECT = gql`
  query {
    listProduct {
      _id
      brand {
        _id
        name
      }
      category {
        _id
        name
      }
      code
      name
    }
  }
`;

export const LIST_PRODUCT_SERIAL_BY_PRODUCT = gql`
  query ListProductSerialByProduct($productId: String!) {
    listProductSerialByProduct(productId: $productId) {
      _id
      purchase_order_detail {
        _id
        purchase_order {
          _id
          code
          status
        }
      }
      sale_order_detail {
        _id
        sale_order {
          _id
          code
          status
        }
      }
      serial
      status
    }
  }
`;

export const SEARCH_PRODUCT = gql`
  query SearchProduct($serial: String!) {
    searchProduct(serial: $serial) {
      _id
      brand {
        _id
        count_product
        description
        is_active
        name
      }
      category {
        _id
        count_product
        description
        is_active
        name
      }
      code
      description
      image
      last_cost_price
      name
      sale_price
      status
      stock
      stock_type
    }
  }
`;
