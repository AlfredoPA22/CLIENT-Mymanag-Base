import { gql } from "@apollo/client";

export const CREATE_PROVIDER = gql`
  mutation Mutation($name: String!, $address: String!, $phoneNumber: String) {
    createProvider(
      providerInput: {
        name: $name
        address: $address
        phoneNumber: $phoneNumber
      }
    ) {
      _id
      code
      name
      address
      phoneNumber
    }
  }
`;

export const DELETE_PROVIDER = gql`
  mutation deleteProvider($providerId: String!) {
    deleteProvider(providerId: $providerId) {
      success
    }
  }
`;

export const UPDATE_PROVIDER = gql`
  mutation UpdateProvider(
    $name: String!
    $address: String!
    $phoneNumber: String!
    $providerId: String!
  ) {
    updateProvider(
      providerId: $providerId
      updateProviderInput: {
        name: $name
        address: $address
        phoneNumber: $phoneNumber
      }
    ) {
      _id
    }
  }
`;
