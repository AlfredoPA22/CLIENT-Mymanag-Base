import { gql } from "@apollo/client";

export const CREATE_PRODUCT = gql`
  mutation createProduct(
    $name: String!
    $code: String!
    $description: String
    $image: String
    $images: [String!]
    $show_in_store: Boolean
    $sale_price: Float
    $store_price: Float
    $store_discount_price: Float
    $category: String!
    $brand: String!
    $stock_type: StockType!
    $min_stock: Int!
    $max_stock: Int!
  ) {
    createProduct(
      productInput: {
        name: $name
        code: $code
        description: $description
        image: $image
        images: $images
        show_in_store: $show_in_store
        sale_price: $sale_price
        store_price: $store_price
        store_discount_price: $store_discount_price
        category: $category
        brand: $brand
        stock_type: $stock_type
        min_stock: $min_stock
        max_stock: $max_stock
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
    $code: String!
    $brand: String!
    $category: String!
    $name: String!
    $image: String!
    $images: [String!]
    $show_in_store: Boolean
    $description: String!
    $sale_price: Float!
    $store_price: Float
    $store_discount_price: Float
    $stock_type: StockType!
    $productId: String!
    $min_stock: Int!
    $max_stock: Int!
  ) {
    updateProduct(
      productId: $productId
      updateProductInput: {
        code: $code
        image: $image
        images: $images
        show_in_store: $show_in_store
        brand: $brand
        category: $category
        name: $name
        description: $description
        sale_price: $sale_price
        store_price: $store_price
        store_discount_price: $store_discount_price
        stock_type: $stock_type
        min_stock: $min_stock
        max_stock: $max_stock
      }
    ) {
      _id
    }
  }
`;

export const SAVE_IMPORT_PRODUCTS = gql`
  mutation SaveImportProducts($importProducts: [PreviewProductImport!]!) {
    saveImportProducts(importProducts: $importProducts) {
      _id
    }
  }
`;
