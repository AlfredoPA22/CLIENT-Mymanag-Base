import { gql } from "@apollo/client";

export const MARK_COMMISSION_PAID = gql`
  mutation MarkCommissionPaid($commissionId: String!) {
    markCommissionPaid(commissionId: $commissionId) {
      _id
      status
      paid_at
    }
  }
`;

export const REVERT_COMMISSION_PAYMENT = gql`
  mutation RevertCommissionPayment($commissionId: String!) {
    revertCommissionPayment(commissionId: $commissionId) {
      _id
      status
      paid_at
    }
  }
`;
