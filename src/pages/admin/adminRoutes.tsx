import { Route, Routes } from "react-router-dom";
import { PermissionRoute } from "../auth/pages/PermissionRoute";
import AdminPage from "./pages/AdminPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PermissionRoute permissions={["USER_AND_ROLE"]}>
            <AdminPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
