import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { OrderSkeleton } from "../../../../components/skeleton/OrderSkeleton";
import { APPROVE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_SALE_ORDER,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import SectionHeader from "../../../../components/sectionHeader/SectionHeader";
import useAuth from "../../../auth/hooks/useAuth";

interface SaleOrderDetailProps {
  saleOrderId: string;
}

const SaleOrderDetail: FC<SaleOrderDetailProps> = ({ saleOrderId }) => {
  const {
    data,
    loading: loadingSaleOrder,
    error: errorSaleOrder,
  } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "network-only",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [approveSaleOrder] = useMutation(APPROVE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  const setApproveSaleOrder = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await approveSaleOrder({
        variables: { saleOrderId },
      });
      if (data) {
        showToast({
          detail: "Venta Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate(
          `${ROUTES_MOCK.SALE_ORDERS}/detalle/${data.approveSaleOrder._id}`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  useEffect(() => {
    if (errorSaleOrder) {
      showToast({
        detail: errorSaleOrder.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [errorSaleOrder]);

  const date = getDate(data?.findSaleOrder.date) || "";

  if (loadingSaleOrder) {
    return <OrderSkeleton />;
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      <SectionHeader
        title="Detalle de venta"
        subtitle="Consulta la información de tu venta y realiza cambios si es necesario."
        actions={
          <Button
            label="Volver a la lista"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={() => navigate(ROUTES_MOCK.SALE_ORDERS)}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Información del proveedor y fecha */}
        <section className="flex flex-col gap-3 border-r md:border-r-gray-300 md:pr-6">
          <div className="grid lg:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <LabelInput name="date" label="Fecha de venta" />
              <span className="text-lg font-medium text-gray-700">{date}</span>
            </div>
            <div className="flex flex-col">
              <LabelInput name="payment_method" label="Condición de pago" />
              <span className="text-lg font-medium text-gray-700">
                {data?.findSaleOrder.payment_method}
              </span>
              {data?.findSaleOrder.payment_method === "Contado" && (
                <span className="text-sm text-gray-500 mt-0.5">
                  {data?.findSaleOrder.contado_payment_method ?? "No especificado"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <LabelInput name="client" label="Cliente" />
            <span className="text-lg font-medium text-gray-700">
              {data?.findSaleOrder.client.fullName}
            </span>
          </div>
        </section>

        {/* Total de venta */}
        <section className="flex flex-col items-center justify-center">
          <LabelInput name="total" label="Total de compra" />
          <span className="text-2xl font-semibold text-green-600">
            {`${data?.findSaleOrder.total} ${currency}`}
          </span>
        </section>

        {/* Estado de la venta */}
        <section className="flex flex-col gap-5 rounded-md">
          <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
            <span className="text-gray-600 text-sm">Código de Orden</span>
            <span className="text-xl font-bold text-gray-800">
              {data?.findSaleOrder.code}
            </span>
            <Tag
              severity={
                getStatus(data?.findSaleOrder.status)?.severity as
                  | "danger"
                  | "success"
                  | "info"
                  | "warning"
              }
            >
              {getStatus(data?.findSaleOrder.status)?.label}
            </Tag>
          </div>

          {data?.findSaleOrder.status !== orderStatus.APROBADO && (
            <div className="flex flex-row justify-center gap-4">
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar venta"
                onClick={setApproveSaleOrder}
                className="mt-2"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SaleOrderDetail;
