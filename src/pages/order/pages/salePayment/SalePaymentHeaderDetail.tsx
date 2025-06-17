import { Tag } from "primereact/tag";
import { FC } from "react";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { PaymentSkeleton } from "../../../../components/skeleton/PaymentSkeleton";
import { IDetailSalePayment } from "../../../../utils/interfaces/SalePayment";
import { getStatus } from "../../utils/getStatus";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import SectionHeader from "../../../../components/sectionHeader/SectionHeader";
import useAuth from "../../../auth/hooks/useAuth";

interface SalePaymentHeaderDetailProps {
  detailSalePayment: IDetailSalePayment;
  loadingDetailSalePayment: boolean;
}

const SalePaymentHeaderDetail: FC<SalePaymentHeaderDetailProps> = ({
  detailSalePayment,
  loadingDetailSalePayment,
}) => {
  const navigate = useNavigate();
  const { currency } = useAuth();

  const goBackToSale = () => {
    navigate(
      `${ROUTES_MOCK.SALE_ORDERS}/detalle/${detailSalePayment.sale_order._id}`
    );
  };

  if (loadingDetailSalePayment) {
    return <PaymentSkeleton />;
  }

  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      {/* Encabezado */}
      <SectionHeader
        title="Detalle de pagos"
        subtitle="Información general de los pagos realizados para esta venta."
        actions={
          <Button
            label="Volver a la venta"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={goBackToSale}
          />
        }
      />

      {/* Información de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput name="total_amount" label="Total a pagar" />
          <span className="text-xl font-semibold text-gray-700">
            {`${detailSalePayment.total_amount} ${currency}`}
          </span>
        </section>

        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput name="total_paid" label="Total pagado" />
          <span className="text-xl font-semibold text-green-600">
            {`${detailSalePayment.total_paid} ${currency}`}
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
            {`${detailSalePayment.total_pending} ${currency}`}
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
