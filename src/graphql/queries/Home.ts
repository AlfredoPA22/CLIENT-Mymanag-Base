import { gql } from "@apollo/client";

export const GENERAL_DATA = gql`
  query GeneralData {
    generalData {
      stock
      total_products_number
      total_products_out
      total_sales_number
      total_sales_value
      best_product {
        _id
        name
        code
        description
        image
      }
      best_product_sales_number
    }
  }
`;

export const REPORT_SALE_ORDER_BY_CLIENT = gql`
  query ReportSaleOrderByClient {
    reportSaleOrderByClient {
      client
      total
    }
  }
`;
