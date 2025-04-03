import { useParams } from "react-router-dom";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailForm from "./SaleOrderDetailForm";
import SaleOrderDetailList from "./SaleOrderDetailList";

const EditSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  return (
    <div className="size-full">
      <SaleOrderDetail saleOrderId={saleOrderId} />
      <SaleOrderDetailForm saleOrderId={saleOrderId} />
      <SaleOrderDetailList saleOrderId={saleOrderId} />
    </div>
  );
};

export default EditSaleOrder;
