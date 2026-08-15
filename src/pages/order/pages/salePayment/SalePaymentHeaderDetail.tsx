import { useQuery } from "@apollo/client";
import { Tag } from "primereact/tag";
import { FC } from "react";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { PaymentSkeleton } from "../../../../components/skeleton/PaymentSkeleton";
import { IDetailSalePayment } from "../../../../utils/interfaces/SalePayment";
import { getStatus } from "../../utils/getStatus";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../../components/sectionHeader/SectionHeader";
import TextLink from "../../../../components/TextLink/TextLink";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import useAuth from "../../../auth/hooks/useAuth";
import { formatAmount } from "../../../../utils/currency";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { paymentExchangeRateSource } from "../../../../utils/enums/paymentExchangeRateSource.enum";

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
  const { data: companyData } = useQuery(DETAIL_COMPANY, { skip: currency !== "$" });
  const company = companyData?.detailCompany;
  // Los totales ya vienen normalizados a la moneda de la venta (puede
  // diferir de la moneda base de la empresa si se vendió en la alterna).
  const orderCurrency = detailSalePayment?.sale_order?.currency ?? currency;
  // Mismo tipo de cambio que usará el formulario de pago para esta nota —
  // el vigente ahora, o el que quedó congelado en la nota (según lo
  // configurado en Ajustes de la empresa).
  const exchangeRate =
    company?.payment_exchange_rate_source === paymentExchangeRateSource.NOTA
      ? detailSalePayment?.sale_order?.exchange_rate ?? company?.exchange_rate
      : company?.exchange_rate;
  // La moneda alterna solo existe para empresas en $ — puede ser Bs (si la
  // venta se hizo en la moneda base) o $ (si se hizo en la alterna).
  const alternateCurrency = orderCurrency === "$" ? "Bs" : "$";
  const toAlternate = (amount: number) =>
    orderCurrency === "$" ? amount * (exchangeRate ?? 1) : amount / (exchangeRate ?? 1);

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
            label="Volver"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={() => navigate(-1)}
          />
        }
      />

      {/* Información de pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput name="total_amount" label="Total a pagar" />
          <span className="text-xl font-semibold text-gray-700">
            {`${formatAmount(detailSalePayment.total_amount)} ${orderCurrency}`}
          </span>
        </section>

        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput name="total_paid" label="Total pagado" />
          <span className="text-xl font-semibold text-green-600">
            {`${formatAmount(detailSalePayment.total_paid)} ${orderCurrency}`}
          </span>
        </section>

        <section className="flex flex-col items-center gap-2 p-4 border rounded-md shadow-sm">
          <LabelInput
            name="total_pending"
            label={detailSalePayment.total_pending < 0 ? "Saldo a favor del cliente" : "Total pendiente"}
          />
          <span
            className={`text-xl font-semibold ${
              detailSalePayment.total_pending < 0
                ? "text-blue-600"
                : detailSalePayment.total_pending > 0
                ? "text-red-500"
                : "text-green-600"
            }`}
          >
            {detailSalePayment.total_pending < 0
              ? `${formatAmount(Math.abs(detailSalePayment.total_pending))} ${orderCurrency}`
              : `${formatAmount(detailSalePayment.total_pending)} ${orderCurrency}`}
          </span>
        </section>
      </div>

      {currency === "$" && !!exchangeRate && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-md border border-blue-100 bg-blue-50 p-4">
          <span className="text-xs font-medium text-blue-700">
            Tipo de cambio: 1 $ = {formatAmount(exchangeRate)} Bs
          </span>
          <div className="grid w-full grid-cols-1 gap-4 text-center md:grid-cols-3">
            <div>
              <span className="block text-xs text-gray-500">Total a pagar en {alternateCurrency}</span>
              <span className="font-semibold text-gray-700">
                {formatAmount(toAlternate(detailSalePayment.total_amount))} {alternateCurrency}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">Total pagado en {alternateCurrency}</span>
              <span className="font-semibold text-green-600">
                {formatAmount(toAlternate(detailSalePayment.total_paid))} {alternateCurrency}
              </span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">
                {detailSalePayment.total_pending < 0 ? `Saldo a favor en ${alternateCurrency}` : `Total pendiente en ${alternateCurrency}`}
              </span>
              <span
                className={`font-semibold ${
                  detailSalePayment.total_pending < 0
                    ? "text-blue-600"
                    : detailSalePayment.total_pending > 0
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {formatAmount(toAlternate(Math.abs(detailSalePayment.total_pending)))} {alternateCurrency}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Código de orden y estado */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center">
          <LabelInput name="code" label="Código de venta" />
          <TextLink
            to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${detailSalePayment.sale_order._id}`}
          >
            <span className="text-lg font-bold text-gray-800">
              {detailSalePayment.sale_order.code}
            </span>
          </TextLink>
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

      {/* Estado de pago */}
      <div className="mt-6 flex justify-center">
        {detailSalePayment.total_pending < 0 ? (
          <Tag severity="info" value={`Saldo a favor: ${formatAmount(Math.abs(detailSalePayment.total_pending))} ${orderCurrency}`} />
        ) : detailSalePayment.sale_order.is_paid ? (
          <Tag severity="success" value="Venta totalmente pagada" />
        ) : (
          <Tag severity="warning" value="Venta con saldo pendiente" />
        )}
      </div>
    </div>
  );
};

export default SalePaymentHeaderDetail;
