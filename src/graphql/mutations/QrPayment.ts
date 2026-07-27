import { gql } from "@apollo/client";

export const GENERATE_DEPOSIT_QR = gql`
  mutation GenerateDepositQr($input: GenerateDepositQrInput!) {
    generateDepositQr(input: $input) {
      transactionId
      transactionStatus
      calculatedFiatAmount
      qrCodeBase64
      referenceId
      fiatCurrency
    }
  }
`;
