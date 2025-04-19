import { type FC } from "react";

import { Route, Routes } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import AdminRoutes from "../pages/admin/adminRoutes";
import UnauthorizedPage from "../pages/auth/pages/UnauthorizedPage";
import ClientRoutes from "../pages/client/ClientRoutes";
import Home from "../pages/home/Home";
import OrderRoutes from "../pages/order/OrderRoutes";
import ProductRoutes from "../pages/product/ProductRoutes";
import ReportsRoutes from "../pages/reports/reportsRoutes";
import { ProtectedRoute } from "./ProtectedRoute";

const PrivateRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />}>
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/product/*" element={<ProductRoutes />} />
          <Route path="/order/*" element={<OrderRoutes />} />
          <Route path="/client/*" element={<ClientRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/reports/*" element={<ReportsRoutes />} />
        </Route>
      </Route>
    </Routes>
  );
};
export default PrivateRoutes;
