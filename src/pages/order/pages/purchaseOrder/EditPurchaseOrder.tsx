import { useParams } from "react-router-dom";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import PurchaseOrderDetailForm from "./PurchaseOrderDetailForm";
import PurchaseOrderDetailList from "./PurchaseOrderDetailList";

const EditPurchaseOrder = () => {
  const { id } = useParams();
  const purchaseOrderId: string = id || "";
  return (
    <div className="size-full">
      <PurchaseOrderDetail purchaseOrderId={purchaseOrderId} />
      <PurchaseOrderDetailForm purchaseOrderId={purchaseOrderId} />
      <PurchaseOrderDetailList purchaseOrderId={purchaseOrderId} />
    </div>
  );
};

export default EditPurchaseOrder;
