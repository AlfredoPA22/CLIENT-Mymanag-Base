import { FC } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/auth/pages/Login";
import PrivateRoutes from "./PrivateRoutes";
import { ROUTES_MOCK } from "./RouteMocks";

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path={ROUTES_MOCK.LOGIN} element={<Login />} />
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
