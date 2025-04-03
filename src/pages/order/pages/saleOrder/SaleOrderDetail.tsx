import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { APPROVE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_SALE_ORDER,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";

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

  const [approveSaleOrder] = useMutation(APPROVE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  const setApproveSaleOrder = async () => {
    try {
      const { data } = await approveSaleOrder({
        variables: { saleOrderId },
      });
      if (data) {
        showToast({
          detail: "Venta Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate("/order/saleOrder");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
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
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      <div className="flex flex-col items-center text-center gap-2 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Detalle de venta</h2>
        <p className="text-gray-500 text-sm">
          Consulta la información de tu venta y realiza cambios si es necesario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Información del proveedor y fecha */}
        <section className="flex flex-col gap-3 border-r md:border-r-gray-300 md:pr-6">
          <div className="flex flex-col">
            <LabelInput name="date" label="Fecha de venta" />
            <span className="text-lg font-medium text-gray-700">{date}</span>
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
            {`${data?.findSaleOrder.total} ${currencySymbol}`}
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
