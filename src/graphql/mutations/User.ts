import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($user_name: String!, $password: String!) {
    login(loginInput: { user_name: $user_name, password: $password })
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($password: String!, $role: String!, $user_name: String!) {
    createUser(
      userInput: { password: $password, role: $role, user_name: $user_name }
    ) {
      _id
    }
  }
`;
