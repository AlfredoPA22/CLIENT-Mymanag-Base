import { useQuery } from "@apollo/client";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { FIND_SALE_ORDER_TO_PDF } from "../../../../graphql/queries/SaleOrder";
import useAuth from "../../../auth/hooks/useAuth";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { getDate } from "../../utils/getDate";
import { convertCurrency, formatAmount } from "../../../../utils/currency";

// Mismo logo por defecto que usa el PDF de venta, para que ambos documentos
// se vean consistentes cuando la empresa no cargó su propio logo.
const DEFAULT_LOGO =
  "https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462281/Logo_Inventasys_1_tp7nlz.png";

// Página independiente (sin sidebar/topbar) pensada para imprimirse en una
// impresora térmica de 80mm. Reutiliza la misma query que ya usa el PDF de
// venta (findSaleOrderToPDF) — no se agregó nada al backend para esto.
const SaleOrderTicket = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currency } = useAuth();

  const { data, loading } = useQuery(FIND_SALE_ORDER_TO_PDF, {
    variables: { saleOrderId: id },
    fetchPolicy: "network-only",
    skip: !id,
  });
  const { data: companyData } = useQuery(DETAIL_COMPANY, { fetchPolicy: "network-only" });

  if (loading || !data?.findSaleOrderToPDF) {
    return <LoadingSpinner />;
  }

  const { saleOrder, saleOrderDetail } = data.findSaleOrderToPDF;
  const company = companyData?.detailCompany;
  // Moneda nativa de la nota (en la que están guardados sale_price/subtotal).
  const noteCurrency = saleOrder.currency ?? currency;
  // Si se abrió desde el toggle de moneda del Detalle, se imprime en esa
  // moneda (convertida con el TC congelado de la nota); si no, en la nativa.
  const ticketCurrency = searchParams.get("currency") ?? noteCurrency;
  const convertAmount = (amount: number) =>
    convertCurrency(amount, noteCurrency, ticketCurrency, saleOrder.exchange_rate);

  const orderDiscount = Number(saleOrder.discount_amount) || 0;
  const hasOrderDiscount = orderDiscount > 0;
  const subtotalBruto = saleOrder.total + orderDiscount;

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

        <p>Pedido: {saleOrder.code}</p>
        <p>Fecha: {getDate(saleOrder.date) ?? "—"}</p>
        <p>Cliente: {saleOrder.client.fullName}</p>
        {saleOrder.client.phoneNumber && <p>Tel: {saleOrder.client.phoneNumber}</p>}
        <p>
          Pago: {saleOrder.payment_method}
          {saleOrder.contado_payment_method ? ` · ${saleOrder.contado_payment_method}` : ""}
        </p>
        <p>Estado de pago: {saleOrder.is_paid ? "Pagado" : "Pendiente"}</p>

        <div className="border-t border-dashed border-black my-1" />

        {saleOrderDetail.map((item: any, idx: number) => {
          const d = item.saleOrderDetail;
          const itemDiscount = Number(d.discount_amount) || 0;
          return (
            <div key={idx} className="mb-1">
              <p className="font-semibold">{d.product?.name ?? d.custom_name}</p>
              <div className="flex justify-between">
                <span>
                  {d.quantity} x {formatAmount(convertAmount(d.sale_price))}
                </span>
                <span>{formatAmount(convertAmount(d.subtotal))} {ticketCurrency}</span>
              </div>
              {itemDiscount > 0 && (
                <div className="flex justify-between italic text-[10px]">
                  <span>
                    Descuento{d.discount_type === "PORCENTUAL" ? ` (${d.discount_value}%)` : ""}
                  </span>
                  <span>-{formatAmount(convertAmount(itemDiscount))} {ticketCurrency}</span>
                </div>
              )}
            </div>
          );
        })}

        <div className="border-t border-dashed border-black my-1" />

        {hasOrderDiscount && (
          <>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatAmount(convertAmount(subtotalBruto))} {ticketCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Descuento general
                {saleOrder.discount_type === "PORCENTUAL" ? ` (${saleOrder.discount_value}%)` : ""}
              </span>
              <span>-{formatAmount(convertAmount(orderDiscount))} {ticketCurrency}</span>
            </div>
          </>
        )}

        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{formatAmount(convertAmount(saleOrder.total))} {ticketCurrency}</span>
        </div>

        <div className="border-t border-dashed border-black my-2" />

        <p className="text-center text-[10px]">¡Gracias por su compra!</p>
      </div>
    </div>
  );
};

export default SaleOrderTicket;
