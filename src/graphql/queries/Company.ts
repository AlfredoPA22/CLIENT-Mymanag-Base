import { gql } from "@apollo/client";

export const DETAIL_COMPANY = gql`
  query DetailCompany {
    detailCompany {
      _id
      name
      legal_name
      nit
      email
      phone
      address
      country
      image
      currency
      plan
      status
    }
  }
`;
