import { useParams } from "react-router-dom";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import PurchaseOrderDetailForm from "./PurchaseOrderDetailForm";
import PurchaseOrderDetailList from "./PurchaseOrderDetailList";
import { Card } from "primereact/card";

const EditPurchaseOrder = () => {
  const { id } = useParams();
  const purchaseOrderId: string = id || "";
  return (
    <Card
      className="size-full"
      title="Editar compra"
    >
      <PurchaseOrderDetail purchaseOrderId={purchaseOrderId} />
      <PurchaseOrderDetailForm purchaseOrderId={purchaseOrderId} />
      <PurchaseOrderDetailList purchaseOrderId={purchaseOrderId} />
    </Card>
  );
};

export default EditPurchaseOrder;
