import { Route, Routes } from "react-router-dom";
import { PermissionRoute } from "../auth/pages/PermissionRoute";
import BrandList from "./pages/brand/BrandList";
import CategoryList from "./pages/category/CategoryList";
import ProductDetail from "./pages/product/ProductDetail";
import ProductList from "./pages/product/ProductList";
import WarehouseList from "./pages/warehouse/WarehouseList";
import { ROUTES_MOCK } from "../../routes/RouteMocks";

const ProductRoutes = () => {
  return (
    <Routes>
      <Route
        path={ROUTES_MOCK.PRODUCTS}
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_PRODUCT"]}>
            <ProductList />
          </PermissionRoute>
        }
      />
      <Route
        path={`${ROUTES_MOCK.PRODUCTS}/detalle/:id`}
        element={
          <PermissionRoute permissions={["FIND_PRODUCT"]}>
            <ProductDetail />
          </PermissionRoute>
        }
      />
      <Route
        path={ROUTES_MOCK.BRANDS}
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_BRAND"]}>
            <BrandList />
          </PermissionRoute>
        }
      />
      <Route
        path={ROUTES_MOCK.CATEGORIES}
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_CATEGORY"]}>
            <CategoryList />
          </PermissionRoute>
        }
      />
      <Route
        path={ROUTES_MOCK.WAREHOUSES}
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_WAREHOUSE"]}>
            <WarehouseList />
          </PermissionRoute>
        }
      />
    </Routes>
  );
};

export default ProductRoutes;
