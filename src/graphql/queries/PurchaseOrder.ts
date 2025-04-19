import { gql } from "@apollo/client";

export const LIST_PURCHASE_ORDER = gql`
  query ListPurchaseOrder {
    listPurchaseOrder {
      _id
      code
      provider {
        _id
        code
        name
      }
      date
      status
      total
    }
  }
`;

export const FIND_PURCHASE_ORDER = gql`
  query FindPurchaseOrder($purchaseOrderId: String!) {
    findPurchaseOrder(purchaseOrderId: $purchaseOrderId) {
      _id
      code
      provider {
        _id
        code
        name
        phoneNumber
      }
      date
      status
      total
    }
  }
`;

export const FIND_PURCHASE_ORDER_TO_PDF = gql`
  query FindPurchaseOrderToPDF($purchaseOrderId: String!) {
    findPurchaseOrderToPDF(purchaseOrderId: $purchaseOrderId) {
      purchaseOrder {
        _id
        code
        provider {
          _id
          code
          name
        }
        date
        status
        total
      }
      purchaseOrderDetail {
        productSerial {
          _id
          serial
        }
        purchaseOrderDetail {
          _id
          product {
            code
            name
            brand {
              _id
              name
            }
          }
          purchase_price
          quantity
          subtotal
        }
      }
    }
  }
`;

export const REPORT_PURCHASE_ORDER_BY_YEAR = gql`
  query ReportPurchaseOrderByYear {
    reportPurchaseOrderByYear {
      month
      total
    }
  }
`;

export const REPORT_PURCHASE_ORDER = gql`
  query PurchaseOrderReport(
    $startDate: Date
    $endDate: Date
    $provider: String
    $status: String
  ) {
    purchaseOrderReport(
      filterPurchaseOrderInput: {
        startDate: $startDate
        endDate: $endDate
        provider: $provider
        status: $status
      }
    ) {
      _id
      code
      date
      provider {
        _id
        name
      }
      status
      total
    }
  }
`;
