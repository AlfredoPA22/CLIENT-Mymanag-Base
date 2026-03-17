import { Routes, Route } from "react-router-dom";
import ClientList from "./pages/ClientList";
import { PermissionRoute } from "../auth/pages/PermissionRoute";

const ClientRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PermissionRoute permissions={["LIST_CLIENT"]}>
            <ClientList />
          </PermissionRoute>
        }
      />
    </Routes>
  );
};

export default ClientRoutes;
