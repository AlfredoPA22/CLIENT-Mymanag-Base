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
