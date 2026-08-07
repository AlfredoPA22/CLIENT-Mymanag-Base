import { useState } from "react";
import { useParams } from "react-router-dom";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailForm from "./SaleOrderDetailForm";
import SaleOrderDetailList from "./SaleOrderDetailList";

const EditSaleOrder = () => {
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
      <SaleOrderDetailForm saleOrderId={saleOrderId} />
      <SaleOrderDetailList saleOrderId={saleOrderId} viewCurrency={viewCurrency} />
    </div>
  );
};

export default EditSaleOrder;
