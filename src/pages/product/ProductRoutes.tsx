import { Route, Routes } from "react-router-dom";
import { PermissionRoute } from "../auth/pages/PermissionRoute";
import BrandList from "./pages/brand/BrandList";
import CategoryList from "./pages/category/CategoryList";
import ProductDetail from "./pages/product/ProductDetail";
import ProductList from "./pages/product/ProductList";
import WarehouseList from "./pages/warehouse/WarehouseList";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import ProductLowStockList from "./pages/product/ProductLowStockList";
import ProductImport from "./pages/product/ProductImport";

const ProductRoutes = () => {
  return (
    <Routes>
      <Route
        path={ROUTES_MOCK.PRODUCTS}
        element={
          <PermissionRoute permissions={["LIST_PRODUCT"]}>
            <ProductList />
          </PermissionRoute>
        }
      />
      <Route
        path={ROUTES_MOCK.LOW_PRODUCTS}
        element={
          <PermissionRoute permissions={["LIST_PRODUCT"]}>
            <ProductLowStockList />
          </PermissionRoute>
        }
      />
      <Route
        path={ROUTES_MOCK.IMPORT_PRODUCTS}
        element={
          <PermissionRoute permissions={["CREATE_PRODUCT"]}>
            <ProductImport />
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
          <PermissionRoute permissions={["LIST_BRAND"]}>
            <BrandList />
          </PermissionRoute>
        }
      />
      <Route
        path={ROUTES_MOCK.CATEGORIES}
        element={
          <PermissionRoute permissions={["LIST_CATEGORY"]}>
            <CategoryList />
          </PermissionRoute>
        }
      />
      <Route
        path={ROUTES_MOCK.WAREHOUSES}
        element={
          <PermissionRoute permissions={["LIST_WAREHOUSE"]}>
            <WarehouseList />
          </PermissionRoute>
        }
      />
    </Routes>
  );
};

export default ProductRoutes;
