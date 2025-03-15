import { gql } from "@apollo/client";

export const CREATE_CLIENT = gql`
  mutation Mutation(
    $firstName: String!
    $lastName: String!
    $phoneNumber: String
  ) {
    createClient(
      clientInput: {
        firstName: $firstName
        lastName: $lastName
        phoneNumber: $phoneNumber
      }
    ) {
      _id
      code
      firstName
      lastName
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
    $firstName: String!
    $lastName: String!
    $phoneNumber: String!
    $clientId: String!
  ) {
    updateClient(
      clientId: $clientId
      updateClientInput: {
        firstName: $firstName
        lastName: $lastName
        phoneNumber: $phoneNumber
      }
    ) {
      _id
    }
  }
`;
