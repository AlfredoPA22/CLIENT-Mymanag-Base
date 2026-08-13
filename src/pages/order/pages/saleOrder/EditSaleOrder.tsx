import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { FIND_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import SaleOrderDetail from "./SaleOrderDetail";
import SaleOrderDetailForm from "./SaleOrderDetailForm";
import SaleOrderDetailList from "./SaleOrderDetailList";

const EditSaleOrder = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";
  const navigate = useNavigate();
  // Compartido entre SaleOrderDetail (dueño del toggle) y SaleOrderDetailList
  // (aplica la conversión a cada línea) para que ambos muestren la misma moneda.
  const [viewCurrency, setViewCurrency] = useState<string | null>(null);

  // El botón "Editar venta" ya se oculta fuera de Borrador, pero eso no
  // impide entrar acá escribiendo la URL a mano — sin este chequeo, una
  // venta Aprobada seguía dejando agregar productos nuevos desde acá (los
  // de editar/eliminar fila sí estaban controlados en SaleOrderDetailList,
  // pero el form de agregar producto no tenía ningún gate). Se verifica acá,
  // en la ruta en sí, para que no dependa de por dónde se haya llegado.
  const { data, loading } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    skip: !saleOrderId,
    fetchPolicy: "network-only",
  });
  const status = data?.findSaleOrder?.status;
  const isBorrador = status === orderStatus.BORRADOR;

  useEffect(() => {
    if (status && !isBorrador) {
      navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${saleOrderId}`, { replace: true });
    }
  }, [status, isBorrador, saleOrderId, navigate]);

  if (loading || !status || !isBorrador) {
    return <LoadingSpinner />;
  }

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
