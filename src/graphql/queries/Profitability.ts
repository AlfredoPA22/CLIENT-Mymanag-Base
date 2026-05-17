import { gql } from "@apollo/client";

export const REPORT_PROFITABILITY = gql`
  query ProfitabilityReport($startDate: Date, $endDate: Date) {
    profitabilityReport(filterInput: { startDate: $startDate, endDate: $endDate }) {
      by_product {
        product_id
        product_code
        product_name
        category_name
        brand_name
        units_sold
        revenue
        cost
        gross_profit
        margin_percent
      }
      by_category {
        category_id
        category_name
        units_sold
        revenue
        cost
        gross_profit
        margin_percent
      }
      total_revenue
      total_cost
      total_gross_profit
      total_margin_percent
    }
  }
`;
