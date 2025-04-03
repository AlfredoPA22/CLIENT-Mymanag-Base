import { gql } from "@apollo/client";

export const CREATE_CLIENT = gql`
  mutation Mutation(
    $fullName: String!
    $email: String
    $address: String
    $phoneNumber: String
  ) {
    createClient(
      clientInput: {
        fullName: $fullName
        email: $email
        address: $address
        phoneNumber: $phoneNumber
      }
    ) {
      _id
      code
      fullName
      email
      address
      phoneNumber
    }
  }
`;

export const DELETE_CLIENT = gql`
  mutation deleteClient($clientId: String!) {
    deleteClient(clientId: $clientId) {
      success
    }
  }
`;

export const UPDATE_CLIENT = gql`
  mutation UpdateClient(
    $fullName: String!
    $email: String!
    $address: String!
    $phoneNumber: String!
    $clientId: String!
  ) {
    updateClient(
      clientId: $clientId
      updateClientInput: {
        fullName: $fullName
        email: $email
        phoneNumber: $phoneNumber
        address: $address
      }
    ) {
      _id
    }
  }
`;
