import { type FC } from "react";

import { Route, Routes } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import Home from "../pages/home/Home";
import ProductRoutes from "../pages/product/ProductRoutes";
import OrderRoutes from "../pages/order/OrderRoutes";
import ClientRoutes from "../pages/client/ClientRoutes";
import ProviderRoutes from "../pages/provider/ProviderRoutes";
import { ProtectedRoute } from "./ProtectedRoute";

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
        </Route>
      </Route>
    </Routes>
  );
};
export default PrivateRoutes;
