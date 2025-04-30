import { Tag } from "primereact/tag";
import { FC } from "react";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { IDetailSalePayment } from "../../../../utils/interfaces/SalePayment";
import { getStatus } from "../../utils/getStatus";

interface SalePaymentHeaderDetailProps {
  detailSalePayment: IDetailSalePayment;
  loadingDetailSalePayment: boolean;
}

const SalePaymentHeaderDetail: FC<SalePaymentHeaderDetailProps> = ({
  detailSalePayment,
  loadingDetailSalePayment,
}) => {
  if (loadingDetailSalePayment) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      {/* Encabezado */}
      <div className="flex flex-col items-center text-center gap-2 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Detalle de pagos</h2>
        <p className="text-gray-500 text-sm">
          Información general de los pagos realizados para esta venta.
        </p>
      </div>

      {/* Información de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput name="total_amount" label="Total a pagar" />
          <span className="text-xl font-semibold text-gray-700">
            {`${detailSalePayment.total_amount} ${currencySymbol}`}
          </span>
        </section>

        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput name="total_paid" label="Total pagado" />
          <span className="text-xl font-semibold text-green-600">
            {`${detailSalePayment.total_paid} ${currencySymbol}`}
          </span>
        </section>

        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput name="total_pending" label="Total pendiente" />
          <span
            className={`text-xl font-semibold ${
              detailSalePayment.total_pending > 0
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {`${detailSalePayment.total_pending} ${currencySymbol}`}
          </span>
        </section>
      </div>

      {/* Código de orden y estado */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center">
          <LabelInput name="code" label="Código de venta" />
          <span className="text-lg font-bold text-gray-800">
            {detailSalePayment.sale_order.code}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-gray-600 text-sm mb-2">Estado del pedido</span>
          <Tag
            severity={
              getStatus(detailSalePayment.sale_order.status)?.severity as
                | "danger"
                | "success"
                | "info"
                | "warning"
            }
          >
            {getStatus(detailSalePayment.sale_order.status)?.label}
          </Tag>
        </div>
      </div>

      {/* Estado de pago completo */}
      <div className="mt-6 flex justify-center">
        {detailSalePayment.sale_order.is_paid ? (
          <Tag severity="success" value="Venta totalmente pagada" />
        ) : (
          <Tag severity="warning" value="Venta con saldo pendiente" />
        )}
      </div>
    </div>
  );
};

export default SalePaymentHeaderDetail;
