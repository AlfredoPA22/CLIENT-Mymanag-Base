import { gql } from "@apollo/client";

export const CREATE_CATEGORY = gql`
  mutation createCategory($name: String!, $description: String) {
    createCategory(categoryInput: { name: $name, description: $description }) {
      _id
      name
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation deleteCategory($categoryId: String!) {
    deleteCategory(categoryId: $categoryId) {
      success
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateBrand(
    $name: String!
    $description: String!
    $categoryId: String!
  ) {
    updateCategory(
      categoryId: $categoryId
      updateCategoryInput: { name: $name, description: $description }
    ) {
      _id
    }
  }
`;
