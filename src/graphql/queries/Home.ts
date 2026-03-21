import { gql } from "@apollo/client";

export const GENERAL_DATA = gql`
  query GeneralData {
    generalData {
      stock
      total_products_number
      total_products_low
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
      total_credit_pending
      total_credit_pending_count
    }
  }
`;

export const REPORT_SALE_ORDER_BY_CLIENT = gql`
  query ReportSaleOrderByClient($startDate: Date, $endDate: Date) {
    reportSaleOrderByClient(startDate: $startDate, endDate: $endDate) {
      client
      total
    }
  }
`;

export const REPORT_SALE_ORDER_BY_SELLER = gql`
  query ReportSaleOrderBySeller($startDate: Date, $endDate: Date) {
    reportSaleOrderBySeller(startDate: $startDate, endDate: $endDate) {
      seller
      total
    }
  }
`;

export const REPORT_SALE_ORDER_BY_CATEGORY = gql`
  query ReportSaleOrderByCategory {
    reportSaleOrderByCategory {
      category
      total
    }
  }
`;

export const REPORT_SALE_ORDER_BY_PRODUCT = gql`
  query ReportSaleOrderByProduct($startDate: Date, $endDate: Date) {
    reportSaleOrderByProduct(startDate: $startDate, endDate: $endDate) {
      product
      total
    }
  }
`;

export const REPORT_MONTHLY_SALES = gql`
  query ReportMonthlySales {
    reportMonthlySales {
      month
      total
    }
  }
`;

export const REPORT_SALE_ORDER_BY_MONTH = gql`
  query ReportSaleOrderByMonth {
    reportSaleOrderByMonth {
      _id
      client {
        fullName
      }
      created_by {
        _id
        user_name
      }
      code
      date
      status
      total
    }
  }
`;
