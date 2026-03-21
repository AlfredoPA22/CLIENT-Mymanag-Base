import { PermissionGuard } from "../auth/pages/PermissionGuard";
import ReportByMonth from "./ReportByMonth";

const SalesSection = () => {
  return (
    <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_MONTH"]}>
      <ReportByMonth />
    </PermissionGuard>
  );
};

export default SalesSection;
