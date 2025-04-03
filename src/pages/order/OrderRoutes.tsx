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

const OrderRoutes = () => {
  return (
    <Routes>
      <Route path="/purchaseOrder" element={<PurchaseOrderPage />} />
      <Route path="/newPurchaseOrder" element={<CreatePurchaseOrder />} />
      <Route path="/editPurchaseOrder/:id" element={<EditPurchaseOrder />} />
      <Route path="/viewPurchaseOrder/:id" element={<ViewPurchaseOrder />} />
      <Route path="/saleOrder" element={<SaleOrderList />} />
      <Route path="/newSaleOrder" element={<CreateSaleOrder />} />
      <Route path="/editSaleOrder/:id" element={<EditSaleOrder />} />
      <Route path="/viewSaleOrder/:id" element={<ViewSaleOrder />} />
      <Route path="/printSaleOrder/:id" element={<PrintSaleOrder />} />
    </Routes>
  );
};

export default OrderRoutes;
