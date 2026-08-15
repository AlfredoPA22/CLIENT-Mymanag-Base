import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import {
  DETAIL_SALE_PAYMENT_BY_SALE_ORDER,
  LIST_SALE_PAYMENT_BY_SALE_ORDER,
} from "../../../../graphql/queries/SalePayment";
import useAuth from "../../../auth/hooks/useAuth";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { getDate } from "../../utils/getDate";
import { formatAmount } from "../../../../utils/currency";
import { ISalePayment } from "../../../../utils/interfaces/SalePayment";

// Mismo logo por defecto que usan el PDF/ticket de venta.
const DEFAULT_LOGO =
  "https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462281/Logo_Inventasys_1_tp7nlz.png";

// Página independiente (sin sidebar/topbar) pensada para imprimirse en una
// impresora térmica de 80mm — mismo patrón que SaleOrderTicket.tsx. No hace
// falta ninguna query nueva en el backend: se reutiliza
// listSalePaymentBySaleOrder (ya trae todo lo que necesita un comprobante)
// y se filtra por el id del pago en el propio frontend.
const SalePaymentTicket = () => {
  const { saleOrderId, paymentId } = useParams();
  const { currency } = useAuth();

  const { data, loading } = useQuery(LIST_SALE_PAYMENT_BY_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "network-only",
    skip: !saleOrderId,
  });
  const { data: detailData, loading: loadingDetail } = useQuery(DETAIL_SALE_PAYMENT_BY_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "network-only",
    skip: !saleOrderId,
  });
  const { data: companyData } = useQuery(DETAIL_COMPANY, { fetchPolicy: "network-only" });

  const payment: ISalePayment | undefined = data?.listSalePaymentBySaleOrder?.find(
    (p: ISalePayment) => p._id === paymentId
  );
  const detail = detailData?.detailSalePaymentBySaleOrder;

  if (loading || loadingDetail || !payment || !detail) {
    return <LoadingSpinner />;
  }

  const company = companyData?.detailCompany;
  const orderCurrency = detail.sale_order.currency ?? currency;
  const paymentCurrency = payment.currency ?? currency;

  return (
    <div className="min-h-screen bg-gray-200 py-6 print:bg-white print:py-0">
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mb-4 flex justify-center">
        <Button label="Imprimir ticket" icon="pi pi-print" onClick={() => window.print()} />
      </div>

      <div className="mx-auto w-[80mm] bg-white p-3 font-mono text-[11px] leading-tight text-black shadow print:w-full print:shadow-none">
        <div className="text-center mb-2">
          <img
            src={company?.image?.trim() ? company.image : DEFAULT_LOGO}
            alt={company?.name || "Logo"}
            className="mx-auto mb-1 max-h-14 max-w-[50mm] object-contain"
          />
          <p className="font-bold text-sm">{company?.name || "Mi Empresa"}</p>
          {company?.nit && <p>NIT: {company.nit}</p>}
          {company?.address && <p>{company.address}</p>}
          {company?.phone && <p>Tel: {company.phone}</p>}
        </div>

        <div className="border-t border-dashed border-black my-1" />

        <p className="text-center font-bold">COMPROBANTE DE PAGO</p>

        <div className="border-t border-dashed border-black my-1" />

        <p>Venta: {detail.sale_order.code}</p>
        <p>Fecha de pago: {getDate(payment.date) ?? "—"}</p>
        <p>Cliente: {detail.sale_order.client.fullName}</p>
        <p>Método: {payment.payment_method}</p>
        <p>Registrado por: {payment.created_by.user_name}</p>
        {payment.note && <p>Nota: {payment.note}</p>}

        <div className="border-t border-dashed border-black my-1" />

        <div className="flex justify-between font-bold text-sm">
          <span>MONTO PAGADO</span>
          <span>{formatAmount(payment.amount)} {paymentCurrency}</span>
        </div>

        {payment.currency === "Bs" && payment.exchange_rate && (
          <p className="text-[10px]">T.C.: 1 $ = {formatAmount(payment.exchange_rate)} Bs</p>
        )}

        <div className="border-t border-dashed border-black my-1" />

        <div className="flex justify-between">
          <span>Total de venta</span>
          <span>{formatAmount(detail.total_amount)} {orderCurrency}</span>
        </div>
        <div className="flex justify-between">
          <span>Total pagado</span>
          <span>{formatAmount(detail.total_paid)} {orderCurrency}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>{detail.total_pending < 0 ? "Saldo a favor" : "Saldo restante"}</span>
          <span>{formatAmount(Math.abs(detail.total_pending))} {orderCurrency}</span>
        </div>

        <div className="border-t border-dashed border-black my-2" />

        <p className="text-center text-[10px]">¡Gracias por su pago!</p>
      </div>
    </div>
  );
};

export default SalePaymentTicket;
