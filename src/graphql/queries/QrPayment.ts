import { gql } from "@apollo/client";

export const QR_PAYMENT_AVAILABLE = gql`
  query QrPaymentAvailable {
    qrPaymentAvailable
  }
`;
