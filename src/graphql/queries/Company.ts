import { gql } from "@apollo/client";

export const DETAIL_COMPANY = gql`
  query DetailCompany {
    detailCompany {
      _id
      name
      slug
      legal_name
      nit
      email
      phone
      address
      country
      image
      currency
      store_enabled
      store_banner_image
      store_theme {
        primary
        primaryDark
        primaryForeground
        dark
        darkLight
        light
      }
      plan
      status
    }
  }
`;
