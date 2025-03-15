import { gql } from "@apollo/client";

export const CREATE_BRAND = gql`
  mutation createBrand($name: String!, $description: String) {
    createBrand(brandInput: { name: $name, description: $description }) {
      _id
    }
  }
`;

export const DELETE_BRAND = gql`
  mutation deleteBrand($brandId: String!) {
    deleteBrand(brandId: $brandId) {
      success
    }
  }
`;

export const UPDATE_BRAND = gql`
  mutation UpdateBrand(
    $name: String!
    $description: String!
    $brandId: String!
  ) {
    updateBrand(
      brandId: $brandId
      updateBrandInput: { name: $name, description: $description }
    ) {
      _id
    }
  }
`;
