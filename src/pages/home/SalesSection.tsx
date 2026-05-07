import { PermissionGuard } from "../auth/pages/PermissionGuard";
import ReportByMonth from "./ReportByMonth";

interface SalesSectionProps {
  startDate: Date;
  endDate: Date;
}

const SalesSection = ({ startDate, endDate }: SalesSectionProps) => {
  return (
    <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_MONTH"]}>
      <ReportByMonth startDate={startDate} endDate={endDate} />
    </PermissionGuard>
  );
};

export default SalesSection;
