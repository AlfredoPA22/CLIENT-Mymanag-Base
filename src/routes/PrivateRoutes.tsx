import { type FC } from "react";

import { Route, Routes } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import ClientRoutes from "../pages/client/ClientRoutes";
import Home from "../pages/home/Home";
import OrderRoutes from "../pages/order/OrderRoutes";
import ProductRoutes from "../pages/product/ProductRoutes";
import ProviderRoutes from "../pages/provider/ProviderRoutes";
import { ProtectedRoute } from "./ProtectedRoute";
import AdminRoutes from "../pages/admin/adminRoutes";

const PrivateRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/*" element={<ProductRoutes />} />
          <Route path="/order/*" element={<OrderRoutes />} />
          <Route path="/client/*" element={<ClientRoutes />} />
          <Route path="/provider/*" element={<ProviderRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Route>
      </Route>
    </Routes>
  );
};
export default PrivateRoutes;
