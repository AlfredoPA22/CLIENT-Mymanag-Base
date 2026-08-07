import { useState } from "react";
import { useParams } from "react-router-dom";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailList from "./SaleOrderDetailList";

const ViewSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  // Compartido entre SaleOrderDetail (dueño del toggle) y SaleOrderDetailList
  // (aplica la conversión a cada línea) para que ambos muestren la misma moneda.
  const [viewCurrency, setViewCurrency] = useState<string | null>(null);
  return (
    <div className="size-full">
      <SaleOrderDetail
        saleOrderId={saleOrderId}
        viewCurrency={viewCurrency}
        onViewCurrencyChange={setViewCurrency}
      />
      <SaleOrderDetailList saleOrderId={saleOrderId} editMode={false} viewCurrency={viewCurrency} />
    </div>
  );
};

export default ViewSaleOrder;
