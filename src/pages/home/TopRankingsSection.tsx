import { useState } from "react";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { PermissionGuard } from "../auth/pages/PermissionGuard";
import ReportByClient from "./ReportByClient";
import ReportBySeller from "./ReportBySeller";

const getDefaultRange = (): [Date, Date] => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return [start, end];
};

const TopRankingsSection = () => {
  const [defaultStart, defaultEnd] = getDefaultRange();

  // Picker state (what the user is editing)
  const [pickerStart, setPickerStart] = useState<Date>(defaultStart);
  const [pickerEnd, setPickerEnd] = useState<Date>(defaultEnd);

  // Applied state (what the charts actually use — only changes on "Aplicar")
  const [appliedStart, setAppliedStart] = useState<Date>(defaultStart);
  const [appliedEnd, setAppliedEnd] = useState<Date>(defaultEnd);

  const handleApply = () => {
    setAppliedStart(pickerStart);
    setAppliedEnd(pickerEnd);
  };

  return (
    <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_CLIENT"]}>
      <div className="flex flex-col gap-3">
        {/* Date range filter */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <span className="text-sm font-medium text-slate-600">Período:</span>
          <div className="flex flex-wrap items-center gap-2">
            <Calendar
              value={pickerStart}
              onChange={(e) => e.value && setPickerStart(e.value as Date)}
              dateFormat="dd/mm/yy"
              placeholder="Desde"
              showIcon
              inputClassName="text-sm"
              className="w-40"
            />
            <span className="text-slate-400 text-sm">—</span>
            <Calendar
              value={pickerEnd}
              onChange={(e) => e.value && setPickerEnd(e.value as Date)}
              dateFormat="dd/mm/yy"
              placeholder="Hasta"
              showIcon
              inputClassName="text-sm"
              className="w-40"
            />
            <Button
              label="Aplicar"
              icon="pi pi-search"
              size="small"
              onClick={handleApply}
            />
          </div>
        </div>

        {/* Charts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ReportByClient startDate={appliedStart} endDate={appliedEnd} />
          <ReportBySeller startDate={appliedStart} endDate={appliedEnd} />
        </div>
      </div>
    </PermissionGuard>
  );
};

export default TopRankingsSection;
