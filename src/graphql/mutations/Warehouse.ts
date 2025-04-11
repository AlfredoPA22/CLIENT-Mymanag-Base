import { gql } from "@apollo/client";

export const CREATE_WAREHOUSE = gql`
  mutation CreateWarehouse($name: String!, $description: String) {
    createWarehouse(
      warehouseInput: { name: $name, description: $description }
    ) {
      _id
      name
      is_active
      description
    }
  }
`;

export const DELETE_WAREHOUSE = gql`
  mutation deleteWarehouse($warehouseId: String!) {
    deleteWarehouse(warehouseId: $warehouseId) {
      success
    }
  }
`;

export const UPDATE_WAREHOUSE = gql`
  mutation UpdateWarehouse(
    $name: String!
    $description: String!
    $warehouseId: String!
  ) {
    updateWarehouse(
      warehouseId: $warehouseId
      updateWarehouseInput: { name: $name, description: $description }
    ) {
      _id
      name
    }
  }
`;
