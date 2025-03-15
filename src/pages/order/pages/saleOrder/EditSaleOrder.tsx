import { Card } from "primereact/card";
import { useParams } from "react-router-dom";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailForm from "./SaleOrderDetailForm";
import SaleOrderDetailList from "./SaleOrderDetailList";

const EditSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  return (
    <Card className="size-full" title="Editar venta">
      <SaleOrderDetail saleOrderId={saleOrderId} />
      <SaleOrderDetailForm saleOrderId={saleOrderId} />
      <SaleOrderDetailList saleOrderId={saleOrderId} />
    </Card>
  );
};

export default EditSaleOrder;
