import { gql } from "@apollo/client";

export const GENERATE_CODE = gql`
  query Query($type: String!) {
    generateCode(type: $type)
  }
`;
