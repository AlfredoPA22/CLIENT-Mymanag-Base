import { gql } from "@apollo/client";

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany($input: UpdateCompanyInput!) {
    updateCompany(updateCompanyInput: $input) {
      _id
      legal_name
      nit
      email
      phone
      address
      country
      image
      currency
    }
  }
`;
