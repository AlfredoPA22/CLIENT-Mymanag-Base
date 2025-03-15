import { Card } from "primereact/card";
import { useParams } from "react-router-dom";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import PurchaseOrderDetailList from "./PurchaseOrderDetailList";

const ViewPurchaseOrder = () => {
  const { id } = useParams();
  const purchaseOrderId: string = id || "";
  return (
    <Card
      className="size-full"
      title="Detalle de compra"
    >
      <PurchaseOrderDetail purchaseOrderId={purchaseOrderId} />
      <PurchaseOrderDetailList purchaseOrderId={purchaseOrderId} />
    </Card>
  );
};

export default ViewPurchaseOrder;
