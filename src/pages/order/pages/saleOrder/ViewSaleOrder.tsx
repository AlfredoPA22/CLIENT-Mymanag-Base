import { useParams } from "react-router-dom";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailList from "./SaleOrderDetailList";

const ViewSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  return (
    <div className="size-full">
      <SaleOrderDetail saleOrderId={saleOrderId} />
      <SaleOrderDetailList saleOrderId={saleOrderId} editMode={false} />
    </div>
  );
};

export default ViewSaleOrder;
