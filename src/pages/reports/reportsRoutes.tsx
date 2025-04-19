import { Route, Routes } from "react-router-dom";
import { PermissionRoute } from "../auth/pages/PermissionRoute";
import ReportsPage from "./pages/ReportsPage";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PermissionRoute
            permissions={[
              "PRODUCT_REPORT",
              "PURCHASE_ORDER_REPORT",
              "SALE_ORDER_REPORT",
            ]}
          >
            <ReportsPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
};

export default ReportsRoutes;
