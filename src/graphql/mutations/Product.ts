import { gql } from "@apollo/client";

export const CREATE_PRODUCT = gql`
  mutation createProduct(
    $name: String!
    $code: String!
    $description: String
    $image: String
    $sale_price: Float
    $category: String!
    $brand: String!
    $stock_type: StockType!
  ) {
    createProduct(
      productInput: {
        name: $name
        code: $code
        description: $description
        image: $image
        sale_price: $sale_price
        category: $category
        brand: $brand
        stock_type: $stock_type
      }
    ) {
      _id
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation deleteProduct($productId: String!) {
    deleteProduct(productId: $productId) {
      success
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $brand: String!
    $category: String!
    $name: String!
    $description: String!
    $sale_price: Float!
    $productId: String!
  ) {
    updateProduct(
      productId: $productId
      updateProductInput: {
        brand: $brand
        category: $category
        name: $name
        description: $description
        sale_price: $sale_price
      }
    ) {
      _id
    }
  }
`;
