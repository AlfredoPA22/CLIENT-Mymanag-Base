import { FC } from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/auth/pages/Login";
import PrivateRoutes from "./PrivateRoutes";

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
