import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($user_name: String!, $password: String!) {
    login(loginInput: { user_name: $user_name, password: $password })
  }
`;
