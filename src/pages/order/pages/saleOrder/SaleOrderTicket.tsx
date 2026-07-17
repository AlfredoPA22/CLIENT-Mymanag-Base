import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { FIND_SALE_ORDER_TO_PDF } from "../../../../graphql/queries/SaleOrder";
import useAuth from "../../../auth/hooks/useAuth";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { getDate } from "../../utils/getDate";

// Página independiente (sin sidebar/topbar) pensada para imprimirse en una
// impresora térmica de 80mm. Reutiliza la misma query que ya usa el PDF de
// venta (findSaleOrderToPDF) — no se agregó nada al backend para esto.
const SaleOrderTicket = () => {
  const { id } = useParams();
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

        <div className="border-t border-dashed border-black my-1" />

        {saleOrderDetail.map((item: any, idx: number) => {
          const d = item.saleOrderDetail;
          return (
            <div key={idx} className="mb-1">
              <p className="font-semibold">{d.product.name}</p>
              <div className="flex justify-between">
                <span>
                  {d.quantity} x {d.sale_price.toFixed(2)}
                </span>
                <span>{d.subtotal.toFixed(2)} {currency}</span>
              </div>
            </div>
          );
        })}

        <div className="border-t border-dashed border-black my-1" />

        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{saleOrder.total.toFixed(2)} {currency}</span>
        </div>

        <div className="border-t border-dashed border-black my-2" />

        <p className="text-center text-[10px]">¡Gracias por su compra!</p>
      </div>
    </div>
  );
};

export default SaleOrderTicket;
