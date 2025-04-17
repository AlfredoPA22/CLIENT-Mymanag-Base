import { PermissionGuard } from "../auth/pages/PermissionGuard";
import ReportByCategory from "./ReportByCategory";
import ReportByMonth from "./ReportByMonth";

const SalesSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_MONTH"]}>
        <ReportByMonth />
      </PermissionGuard>

      <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_CATEGORY"]}>
        <ReportByCategory />
      </PermissionGuard>
    </div>
  );
};

export default SalesSection;
