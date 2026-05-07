import { PermissionGuard } from "../auth/pages/PermissionGuard";
import ReportByClient from "./ReportByClient";
import ReportBySeller from "./ReportBySeller";
import ReportByProduct from "./ReportByProduct";
import ReportMonthlySales from "./ReportMonthlySales";
import ReportByCategory from "./ReportByCategory";

interface TopRankingsSectionProps {
  startDate: Date;
  endDate: Date;
}

const TopRankingsSection = ({ startDate, endDate }: TopRankingsSectionProps) => {
  return (
    <div className="flex flex-col gap-3">

      {/* ── Fila 1: Tendencia mensual (2/3) + Categorías (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_MONTH"]}>
          <div className="lg:col-span-2">
            <ReportMonthlySales />
          </div>
        </PermissionGuard>
        <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_CATEGORY"]}>
          <ReportByCategory startDate={startDate} endDate={endDate} />
        </PermissionGuard>
      </div>

      {/* ── Fila 2: Top 10 Clientes + Vendedores + Productos (3 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_CLIENT"]}>
          <ReportByClient startDate={startDate} endDate={endDate} />
        </PermissionGuard>
        <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_SELLER"]}>
          <ReportBySeller startDate={startDate} endDate={endDate} />
        </PermissionGuard>
        <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_PRODUCT"]}>
          <ReportByProduct startDate={startDate} endDate={endDate} />
        </PermissionGuard>
      </div>

    </div>
  );
};

export default TopRankingsSection;
