import { Card } from "primereact/card";
import { useParams } from "react-router-dom";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailList from "./SaleOrderDetailList";

const ViewSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  return (
    <Card className="size-full" title="Detalle de venta">
      <SaleOrderDetail saleOrderId={saleOrderId} />
      <SaleOrderDetailList saleOrderId={saleOrderId} />
    </Card>
  );
};

export default ViewSaleOrder;
