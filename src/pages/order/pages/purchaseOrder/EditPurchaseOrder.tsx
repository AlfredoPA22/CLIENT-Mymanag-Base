import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { FIND_PURCHASE_ORDER } from "../../../../graphql/queries/PurchaseOrder";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import PurchaseOrderDetailForm from "./PurchaseOrderDetailForm";
import PurchaseOrderDetailList from "./PurchaseOrderDetailList";

const EditPurchaseOrder = () => {
  const { id } = useParams();
  const purchaseOrderId: string = id || "";
  const navigate = useNavigate();

  // Mismo chequeo que en EditSaleOrder.tsx: sin esto, escribir la URL de
  // editar a mano dejaba agregar/editar productos en una compra ya Aprobada,
  // aunque el botón para llegar acá estuviera escondido en otras pantallas.
  const { data, loading } = useQuery(FIND_PURCHASE_ORDER, {
    variables: { purchaseOrderId },
    skip: !purchaseOrderId,
    fetchPolicy: "network-only",
  });
  const status = data?.findPurchaseOrder?.status;
  const isBorrador = status === orderStatus.BORRADOR;

  useEffect(() => {
    if (status && !isBorrador) {
      navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${purchaseOrderId}`, { replace: true });
    }
  }, [status, isBorrador, purchaseOrderId, navigate]);

  if (loading || !status || !isBorrador) {
    return <LoadingSpinner />;
  }

  return (
    <div className="size-full">
      <PurchaseOrderDetail purchaseOrderId={purchaseOrderId} />
      <PurchaseOrderDetailForm purchaseOrderId={purchaseOrderId} />
      <PurchaseOrderDetailList purchaseOrderId={purchaseOrderId} />
    </div>
  );
};

export default EditPurchaseOrder;
