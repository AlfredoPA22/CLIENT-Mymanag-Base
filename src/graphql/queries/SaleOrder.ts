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
