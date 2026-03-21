import { useState } from "react";
import { Calendar } from "primereact/calendar";
import { PermissionGuard } from "../auth/pages/PermissionGuard";
import ReportByClient from "./ReportByClient";
import ReportBySeller from "./ReportBySeller";
import ReportByProduct from "./ReportByProduct";
import ReportMonthlySales from "./ReportMonthlySales";
import ReportByCategory from "./ReportByCategory";

const getDefaultRange = (): [Date, Date] => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return [start, end];
};

const TopRankingsSection = () => {
  const [defaultStart, defaultEnd] = getDefaultRange();
  const [dateRange, setDateRange] = useState<(Date | null)[]>([defaultStart, defaultEnd]);
  const [appliedRange, setAppliedRange] = useState<[Date, Date]>([defaultStart, defaultEnd]);

  const handleDateChange = (value: Date | (Date | null)[] | null) => {
    if (Array.isArray(value)) {
      setDateRange(value);
      if (value[0] && value[1]) {
        setAppliedRange([value[0], value[1]]);
      }
    }
  };

  const [appliedStart, appliedEnd] = appliedRange;

  return (
    <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_CLIENT"]}>
      <div className="flex flex-col gap-3">

        {/* ── Fila 1: Tendencia mensual (2/3) + Categorías (1/3) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <ReportMonthlySales />
          </div>
          <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_CATEGORY"]}>
            <ReportByCategory />
          </PermissionGuard>
        </div>

        {/* ── Selector de período (range en un solo picker) ── */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-slate-600">Período:</span>
          <Calendar
            value={dateRange as Date[]}
            onChange={(e) => handleDateChange(e.value as (Date | null)[] | null)}
            selectionMode="range"
            dateFormat="dd/mm/yy"
            placeholder="Seleccionar período"
            showIcon
            showButtonBar
            inputClassName="text-sm"
            className="w-64"
          />
        </div>

        {/* ── Fila 2: Top 10 Clientes + Vendedores + Productos (3 cols) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <ReportByClient startDate={appliedStart} endDate={appliedEnd} />
          <ReportBySeller startDate={appliedStart} endDate={appliedEnd} />
          <ReportByProduct startDate={appliedStart} endDate={appliedEnd} />
        </div>

      </div>
    </PermissionGuard>
  );
};

export default TopRankingsSection;
