import { useQuery } from "@apollo/client";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { FIND_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailList from "./SaleOrderDetailList";

const ViewSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  // Compartido entre SaleOrderDetail (dueño del toggle) y SaleOrderDetailList
  // (aplica la conversión a cada línea) para que ambos muestren la misma moneda.
  const [viewCurrency, setViewCurrency] = useState<string | null>(null);

  // Solo para saber si la venta sigue en Borrador — en ese caso se permite
  // agregar seriales directo desde el Detalle, sin tener que ir a Editar
  // venta. Comparte cache con la misma query que ya usa SaleOrderDetail.
  const { data } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    skip: !saleOrderId,
  });
  const isBorrador = data?.findSaleOrder?.status === orderStatus.BORRADOR;

  return (
    <div className="size-full">
      <SaleOrderDetail
        saleOrderId={saleOrderId}
        viewCurrency={viewCurrency}
        onViewCurrencyChange={setViewCurrency}
      />
      <SaleOrderDetailList
        saleOrderId={saleOrderId}
        editMode={false}
        allowAddSerials={isBorrador}
        viewCurrency={viewCurrency}
      />
    </div>
  );
};

export default ViewSaleOrder;
