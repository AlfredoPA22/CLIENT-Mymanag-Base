import { gql } from "@apollo/client";

export const LIST_SALE_ORDER = gql`
  query ListSaleOrder {
    listSaleOrder {
      _id
      code
      client {
        _id
        code
        fullName
        phoneNumber
      }
      created_by {
        _id
        user_name
      }
      payment_method
      is_paid
      date
      status
      total
    }
  }
`;

export const FIND_SALE_ORDER = gql`
  query FindSaleOrder($saleOrderId: String!) {
    findSaleOrder(saleOrderId: $saleOrderId) {
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
    }
  }
`;

export const FIND_SALE_ORDER_TO_PDF = gql`
  query FindSaleOrderToPDF($saleOrderId: String!) {
    findSaleOrderToPDF(saleOrderId: $saleOrderId) {
      saleOrder {
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
      }
      saleOrderDetail {
        productSerial {
          _id
          serial
        }
        saleOrderDetail {
          _id
          product {
            code
            name
            brand {
              _id
              name
            }
          }
          sale_price
          quantity
          subtotal
        }
      }
    }
  }
`;

export const REPORT_SALE_ORDER_BY_YEAR = gql`
  query ReportSaleOrderByYear {
    reportSaleOrderByYear {
      month
      total
    }
  }
`;

export const REPORT_SALE_ORDER = gql`
  query SaleOrderReport(
    $startDate: Date
    $endDate: Date
    $client: String
    $status: String
  ) {
    saleOrderReport(
      filterSaleOrderInput: {
        startDate: $startDate
        endDate: $endDate
        client: $client
        status: $status
      }
    ) {
      _id
      code
      date
      client {
        _id
        fullName
      }
      status
      total
    }
  }
`;
