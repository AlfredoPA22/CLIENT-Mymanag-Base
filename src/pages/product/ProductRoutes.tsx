import { Route, Routes } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";
import ProductPage from "./pages/ProductPage";
import { PermissionRoute } from "../auth/pages/PermissionRoute";

const ProductRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PermissionRoute
            permissions={[
              "LIST_AND_CREATE_PRODUCT",
              "LIST_AND_CREATE_BRAND",
              "LIST_AND_CREATE_CATEGORY",
              "LIST_AND_CREATE_WAREHOUSE",
            ]}
          >
            <ProductPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/Detail/:id"
        element={
          <PermissionRoute permissions={["FIND_PRODUCT"]}>
            <ProductDetail />
          </PermissionRoute>
        }
      />
    </Routes>
  );
};

export default ProductRoutes;
