import { type FC } from "react";

import { Route, Routes } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import RoleList from "../pages/admin/pages/role/RoleList";
import UserList from "../pages/admin/pages/user/UserList";
import { PermissionRoute } from "../pages/auth/pages/PermissionRoute";
import UnauthorizedPage from "../pages/auth/pages/UnauthorizedPage";
import ClientList from "../pages/client/pages/ClientList";
import Home from "../pages/home/Home";
import WelcomePage from "../pages/home/WelcomePage";
import CreatePurchaseOrder from "../pages/order/pages/purchaseOrder/CreatePurchaseOrder";
import EditPurchaseOrder from "../pages/order/pages/purchaseOrder/EditPurchaseOrder";
import PurchaseOrderList from "../pages/order/pages/purchaseOrder/PurchaseOrderList";
import ViewPurchaseOrder from "../pages/order/pages/purchaseOrder/viewPurchaseOrder";
import CreateSaleOrder from "../pages/order/pages/saleOrder/CreateSaleOrder";
import EditSaleOrder from "../pages/order/pages/saleOrder/EditSaleOrder";
import SaleOrderList from "../pages/order/pages/saleOrder/SaleOrderList";
import ViewSaleOrder from "../pages/order/pages/saleOrder/ViewSaleOrder";
import ProductRoutes from "../pages/product/ProductRoutes";
import ProviderList from "../pages/provider/pages/ProviderList";
import ReportsPage from "../pages/reports/pages/ReportsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ROUTES_MOCK } from "./RouteMocks";
import SalePayment from "../pages/order/pages/salePayment/SalePayment";
import CompanySettings from "../pages/settings/CompanySettings";
import ProductTransferList from "../pages/transfer/ProductTransferList";
import CreateProductTransfer from "../pages/transfer/CreateProductTransfer";
import EditProductTransfer from "../pages/transfer/EditProductTransfer";
import ViewProductTransfer from "../pages/transfer/ViewProductTransfer";
import SaleReturnList from "../pages/order/pages/saleReturn/SaleReturnList";

const PrivateRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />}>
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          {/* Página de bienvenida como ruta por defecto */}
          <Route index element={<WelcomePage />} />

          {/* inicio */}
          <Route path={ROUTES_MOCK.DASHBOARD} element={<Home />} />

          {/* inventario */}
          <Route
            path={`${ROUTES_MOCK.INVENTORY}/*`}
            element={<ProductRoutes />}
          />

          {/* compras */}
          <Route
            path={`${ROUTES_MOCK.PURCHASE_ORDERS}`}
            element={
              <PermissionRoute permissions={["LIST_PURCHASE"]}>
                <PurchaseOrderList />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.NEW_PURCHASE_ORDER}`}
            element={
              <PermissionRoute permissions={["CREATE_PURCHASE"]}>
                <CreatePurchaseOrder />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/:id`}
            element={
              <PermissionRoute permissions={["EDIT_PURCHASE"]}>
                <EditPurchaseOrder />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/:id`}
            element={
              <PermissionRoute permissions={["DETAIL_PURCHASE"]}>
                <ViewPurchaseOrder />
              </PermissionRoute>
            }
          />

          {/* proveedores */}
          <Route
            path={`${ROUTES_MOCK.PROVIDERS}`}
            element={
              <PermissionRoute permissions={["LIST_PROVIDER"]}>
                <ProviderList />
              </PermissionRoute>
            }
          />

          {/* ventas */}
          <Route
            path={`${ROUTES_MOCK.SALE_ORDERS}`}
            element={
              <PermissionRoute permissions={["LIST_SALE"]}>
                <SaleOrderList />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.NEW_SALE_ORDER}`}
            element={
              <PermissionRoute permissions={["CREATE_SALE"]}>
                <CreateSaleOrder />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.EDIT_SALE_ORDER}/:id`}
            element={
              <PermissionRoute permissions={["EDIT_SALE"]}>
                <EditSaleOrder />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.SALE_ORDERS}/detalle/:id`}
            element={
              <PermissionRoute permissions={["DETAIL_SALE"]}>
                <ViewSaleOrder />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.SALE_PAYMENT}/:id`}
            element={
              <PermissionRoute permissions={["LIST_PAYMENT"]}>
                <SalePayment />
              </PermissionRoute>
            }
          />

          {/* clientes */}
          <Route
            path={`${ROUTES_MOCK.CLIENTS}`}
            element={
              <PermissionRoute permissions={["LIST_CLIENT"]}>
                <ClientList />
              </PermissionRoute>
            }
          />

          {/* reportes */}
          <Route
            path={`${ROUTES_MOCK.REPORTS}`}
            element={
              <PermissionRoute
                permissions={[
                  "PRODUCT_REPORT",
                  "PURCHASE_ORDER_REPORT",
                  "SALE_ORDER_REPORT",
                ]}
              >
                <ReportsPage />
              </PermissionRoute>
            }
          />

          {/* usuarios */}
          <Route
            path={`${ROUTES_MOCK.USERS}`}
            element={
              <PermissionRoute permissions={["USER_AND_ROLE"]}>
                <UserList />
              </PermissionRoute>
            }
          />

          {/* roles */}
          <Route
            path={`${ROUTES_MOCK.ROLES}`}
            element={
              <PermissionRoute permissions={["USER_AND_ROLE"]}>
                <RoleList />
              </PermissionRoute>
            }
          />

          {/* transferencias */}
          <Route
            path={`${ROUTES_MOCK.TRANSFERS}`}
            element={
              <PermissionRoute permissions={["LIST_TRANSFER"]}>
                <ProductTransferList />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.TRANSFERS}${ROUTES_MOCK.NEW_TRANSFER}`}
            element={
              <PermissionRoute permissions={["CREATE_TRANSFER"]}>
                <CreateProductTransfer />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.TRANSFERS}${ROUTES_MOCK.EDIT_TRANSFER}/:id`}
            element={
              <PermissionRoute permissions={["EDIT_TRANSFER"]}>
                <EditProductTransfer />
              </PermissionRoute>
            }
          />
          <Route
            path={`${ROUTES_MOCK.TRANSFERS}/detalle/:id`}
            element={
              <PermissionRoute permissions={["DETAIL_TRANSFER"]}>
                <ViewProductTransfer />
              </PermissionRoute>
            }
          />

          {/* devoluciones */}
          <Route
            path={`${ROUTES_MOCK.SALE_RETURNS}`}
            element={
              <PermissionRoute permissions={["LIST_SALE"]}>
                <SaleReturnList />
              </PermissionRoute>
            }
          />

          {/* configuración de empresa */}
          <Route
            path={`${ROUTES_MOCK.SETTINGS}`}
            element={
              <PermissionRoute permissions={["UPDATE_COMPANY"]}>
                <CompanySettings />
              </PermissionRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};
export default PrivateRoutes;
