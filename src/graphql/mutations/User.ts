import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($user_name: String!, $password: String!) {
    login(loginInput: { user_name: $user_name, password: $password })
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser(
    $password: String!
    $role: String!
    $user_name: String!
    $is_global: Boolean!
  ) {
    createUser(
      userInput: {
        password: $password
        role: $role
        user_name: $user_name
        is_global: $is_global
      }
    ) {
      _id
    }
  }
`;

export const UPDATE_USER = gql`
  mutation Mutation(
    $userId: String!
    $role: String!
    $user_name: String!
    $is_global: Boolean!
  ) {
    updateUser(
      userId: $userId
      updateUserInput: {
        user_name: $user_name
        role: $role
        is_global: $is_global
      }
    ) {
      _id
    }
  }
`;

export const CHANGE_USER_STATUS = gql`
  mutation SwitchUserState($userId: String!) {
    switchUserState(userId: $userId) {
      _id
      user_name
      is_active
    }
  }
`;

export const DELETE_USER = gql`
  mutation Mutation($userId: String!) {
    deleteUser(userId: $userId) {
      success
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation Mutation(
    $userId: String!
    $currentPassword: String!
    $newPassword: String!
  ) {
    changePassword(
      userId: $userId
      changePasswordInput: {
        currentPassword: $currentPassword
        newPassword: $newPassword
      }
    ) {
      _id
    }
  }
`;