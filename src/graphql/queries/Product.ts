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

export const LIST_PRODUCT_BY_CATEGORY = gql`
  query listFoodByCategory($id_category: String!) {
    listFoodByCategory(id_category: $id_category) {
      _id
      category {
        _id
        name
        color
      }
      code
      description
      image
      is_active
      name
      sale_price
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
