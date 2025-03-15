import { Card } from "primereact/card";
import { useParams } from "react-router-dom";
import CardPrintSaleOrderDetail from "./CardPrintSaleOrder";

const PrintSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  return (
    <Card className="size-full" title="Detalle de venta">
      <CardPrintSaleOrderDetail saleOrderId={saleOrderId} />
    </Card>
  );
};

export default PrintSaleOrder;
