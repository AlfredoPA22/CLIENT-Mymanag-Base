import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { DETAIL_COMPANY } from "../../graphql/queries/Company";
import { FIND_COMMISSION } from "../../graphql/queries/Commission";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { getDate } from "../order/utils/getDate";
import { formatAmount } from "../../utils/currency";
import useAuth from "../auth/hooks/useAuth";

const DEFAULT_LOGO =
  "https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462281/Logo_Inventasys_1_tp7nlz.png";

// Misma idea que SaleOrderTicket.tsx/SalePaymentTicket.tsx: página
// independiente (sin sidebar/topbar) pensada para imprimirse en una
// impresora térmica de 80mm.
const CommissionTicket = () => {
  const { id } = useParams();
  const { currency } = useAuth();

  const { data, loading } = useQuery(FIND_COMMISSION, {
    variables: { commissionId: id },
    fetchPolicy: "network-only",
    skip: !id,
  });
  const { data: companyData } = useQuery(DETAIL_COMPANY, { fetchPolicy: "network-only" });

  if (loading || !data?.findCommission) {
    return <LoadingSpinner />;
  }

  const commission = data.findCommission;
  const company = companyData?.detailCompany;
  const saleOrder = commission.sale_order;

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

        <p className="text-center font-bold mb-1">COMPROBANTE DE COMISIÓN</p>

        <div className="border-t border-dashed border-black my-1" />

        <p>Vendedor: {commission.seller?.user_name ?? "—"}</p>
        <p>Venta: {saleOrder ? saleOrder.code : "Venta eliminada"}</p>
        {saleOrder && <p>Cliente: {saleOrder.client?.fullName}</p>}
        {saleOrder && (
          <p>
            Total venta: {formatAmount(saleOrder.total)} {saleOrder.currency ?? currency}
          </p>
        )}
        <p>Fecha: {getDate(commission.createdAt) ?? "—"}</p>
        <p>Estado: {commission.status}</p>

        <div className="border-t border-dashed border-black my-1" />

        <div className="flex justify-between">
          <span>Tasa</span>
          <span>{commission.rate}%</span>
        </div>
        <div className="flex justify-between font-bold text-sm">
          <span>COMISIÓN</span>
          <span>{formatAmount(commission.amount)} {currency}</span>
        </div>

        {commission.paid_at && (
          <>
            <div className="border-t border-dashed border-black my-1" />
            <p>Pagada: {getDate(commission.paid_at)}</p>
            {commission.paid_by && <p>Pagado por: {commission.paid_by.user_name}</p>}
          </>
        )}

        <div className="border-t border-dashed border-black my-2" />

        <p className="text-center text-[10px]">Documento no fiscal</p>
      </div>
    </div>
  );
};

export default CommissionTicket;
