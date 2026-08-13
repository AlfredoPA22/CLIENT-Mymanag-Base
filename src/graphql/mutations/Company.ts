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
      exchange_rate
      store_enabled
      store_banner_image
      pos_sale_mode_enabled
      store_theme {
        primary
        primaryDark
        primaryForeground
        dark
        darkLight
        light
      }
    }
  }
`;
