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
      image
      sale_price
      status
      stock
      stock_type
      min_stock
      max_stock
    }
  }
`;

export const LIST_LOW_STOCK_PRODUCT = gql`
  query {
    listLowStockProduct {
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
      image
      sale_price
      status
      stock
      stock_type
      min_stock
      max_stock
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
      warehouse {
        _id
        name
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

export const LIST_PRODUCT_INVENTORY_BY_PRODUCT = gql`
  query ListProductInventoryByProduct($productId: String!) {
    listProductInventoryByProduct(productId: $productId) {
      _id
      purchase_order_detail {
        _id
        purchase_order {
          _id
          code
          status
        }
      }
      warehouse {
        _id
        name
      }
      quantity
      available
      reserved
      sold
      transferred
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
      min_stock
      max_stock
    }
  }
`;

export const FIND_PRODUCT = gql`
  query FindProduct($productId: String!) {
    findProduct(productId: $productId) {
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
      image
      last_cost_price
      name
      sale_price
      status
      stock
      stock_type
      min_stock
      max_stock
    }
  }
`;

export const LIST_PRODUCT_WITH_PARAMS = gql`
  query ListProductWithParams(
    $brandId: String
    $categoryId: String
    $warehouseId: String
  ) {
    listProductWithParams(
      brandId: $brandId
      categoryId: $categoryId
      warehouseId: $warehouseId
    ) {
      _id
      brand {
        name
        _id
      }
      category {
        name
        _id
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
      min_stock
      max_stock
    }
  }
`;

export const REPORT_PRODUCT = gql`
  query Query($brand: String, $category: String, $status: String) {
    productReport(
      filterProductInput: {
        brand: $brand
        category: $category
        status: $status
      }
    ) {
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
