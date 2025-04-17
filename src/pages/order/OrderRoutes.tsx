import { Route, Routes } from "react-router-dom";
import CreatePurchaseOrder from "./pages/purchaseOrder/CreatePurchaseOrder";
import EditPurchaseOrder from "./pages/purchaseOrder/EditPurchaseOrder";
import PurchaseOrderPage from "./pages/purchaseOrder/PurchaOrderPage";
import ViewPurchaseOrder from "./pages/purchaseOrder/viewPurchaseOrder";
import CreateSaleOrder from "./pages/saleOrder/CreateSaleOrder";
import EditSaleOrder from "./pages/saleOrder/EditSaleOrder";
import PrintSaleOrder from "./pages/saleOrder/PrintSaleOrder";
import SaleOrderList from "./pages/saleOrder/SaleOrderList";
import ViewSaleOrder from "./pages/saleOrder/ViewSaleOrder";
import { PermissionRoute } from "../auth/pages/PermissionRoute";

const OrderRoutes = () => {
  return (
    <Routes>
      <Route
        path="/purchaseOrder"
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_PURCHASE"]}>
            <PurchaseOrderPage />
          </PermissionRoute>
        }
      />
      <Route
        path="/newPurchaseOrder"
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_PURCHASE"]}>
            <CreatePurchaseOrder />
          </PermissionRoute>
        }
      />
      <Route
        path="/editPurchaseOrder/:id"
        element={
          <PermissionRoute permissions={["EDIT_PURCHASE"]}>
            <EditPurchaseOrder />
          </PermissionRoute>
        }
      />
      <Route
        path="/viewPurchaseOrder/:id"
        element={
          <PermissionRoute permissions={["DETAIL_PURCHASE"]}>
            <ViewPurchaseOrder />
          </PermissionRoute>
        }
      />
      <Route
        path="/saleOrder"
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_SALE"]}>
            <SaleOrderList />
          </PermissionRoute>
        }
      />
      <Route
        path="/newSaleOrder"
        element={
          <PermissionRoute permissions={["LIST_AND_CREATE_SALE"]}>
            <CreateSaleOrder />
          </PermissionRoute>
        }
      />
      <Route
        path="/editSaleOrder/:id"
        element={
          <PermissionRoute permissions={["EDIT_SALE"]}>
            <EditSaleOrder />
          </PermissionRoute>
        }
      />
      <Route
        path="/viewSaleOrder/:id"
        element={
          <PermissionRoute permissions={["DETAIL_SALE"]}>
            <ViewSaleOrder />
          </PermissionRoute>
        }
      />
      <Route
        path="/printSaleOrder/:id"
        element={
          <PermissionRoute permissions={["DETAIL_SALE"]}>
            <PrintSaleOrder />
          </PermissionRoute>
        }
      />
    </Routes>
  );
};

export default OrderRoutes;
