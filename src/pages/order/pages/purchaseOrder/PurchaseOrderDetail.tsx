import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { OrderSkeleton } from "../../../../components/skeleton/OrderSkeleton";
import { APPROVE_PURCHASE_ORDER } from "../../../../graphql/mutations/PurchaseOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_PURCHASE_ORDER,
  LIST_PURCHASE_ORDER,
} from "../../../../graphql/queries/PurchaseOrder";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import SectionHeader from "../../../../components/sectionHeader/SectionHeader";
import useAuth from "../../../auth/hooks/useAuth";

interface PurchaseOrderDetailProps {
  purchaseOrderId: string;
}

const PurchaseOrderDetail: FC<PurchaseOrderDetailProps> = ({ purchaseOrderId }) => {
  const {
    data,
    loading: loadingPurchaseOrder,
    error: errorPurchaseOrder,
  } = useQuery(FIND_PURCHASE_ORDER, {
    variables: { purchaseOrderId },
    fetchPolicy: "network-only",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [approvePurchaseOrder] = useMutation(APPROVE_PURCHASE_ORDER, {
    refetchQueries: [{ query: LIST_PURCHASE_ORDER }, { query: LIST_PRODUCT }],
  });

  const setApprovePurchaseOrder = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await approvePurchaseOrder({ variables: { purchaseOrderId } });
      if (data) {
        showToast({ detail: "Compra Aprobada exitosamente", severity: ToastSeverity.Success });
        navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${data.approvePurchaseOrder._id}`);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  useEffect(() => {
    if (errorPurchaseOrder) {
      showToast({ detail: errorPurchaseOrder.message, severity: ToastSeverity.Error });
    }
  }, [errorPurchaseOrder]);

  if (loadingPurchaseOrder) return <OrderSkeleton />;

  const order = data?.findPurchaseOrder;
  const date = getDate(order?.date) || "";
  const status = getStatus(order?.status);
  const isAprobado = order?.status === orderStatus.APROBADO;

  return (
    <div className="p-4 md:p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      <SectionHeader
        title="Detalle de compra"
        subtitle="Consulta la información de tu compra y realiza cambios si es necesario."
        actions={
          <Button
            label="Volver"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={() => navigate(ROUTES_MOCK.PURCHASE_ORDERS)}
          />
        }
      />

      {/* ── Mobile: código + estado destacado ─────────────── */}
      <div className="md:hidden flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3 mb-4">
        <span className="text-base font-bold text-gray-800">{order?.code}</span>
        {status && (
          <Tag severity={status.severity as "danger" | "success" | "info" | "warning"}>
            {status.label}
          </Tag>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
        {/* Proveedor y fecha */}
        <section className="flex flex-col gap-3 md:border-r md:border-r-gray-300 md:pr-6">
          <div className="flex flex-col">
            <LabelInput name="date" label="Fecha de compra" />
            <span className="text-base md:text-lg font-medium text-gray-700">{date}</span>
          </div>
          <div className="flex flex-col">
            <LabelInput name="provider" label="Proveedor" />
            <span className="text-base md:text-lg font-medium text-gray-700 break-words">
              {order?.provider?.name}
            </span>
          </div>
        </section>

        {/* Total */}
        <section className="flex flex-col items-start md:items-center justify-center">
          <LabelInput name="total" label="Total de compra" />
          <span className="text-xl md:text-2xl font-semibold text-green-600">
            {`${order?.total} ${currency}`}
          </span>
        </section>

        {/* Código + estado + acciones */}
        <section className="flex flex-col gap-4 rounded-md">
          {/* Card de código/estado — oculto en mobile (se muestra arriba) */}
          <div className="hidden md:flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
            <span className="text-gray-600 text-sm">Código de Orden</span>
            <span className="text-xl font-bold text-gray-800">{order?.code}</span>
            {status && (
              <Tag severity={status.severity as "danger" | "success" | "info" | "warning"}>
                {status.label}
              </Tag>
            )}
          </div>

          {!isAprobado && (
            <Button
              icon="pi pi-check-circle"
              type="button"
              severity="success"
              label="Aprobar compra"
              onClick={setApprovePurchaseOrder}
              className="w-full"
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;
