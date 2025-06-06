import { Card } from "primereact/card";
import SearchProductForm from "../product/pages/product/SearchProductForm";
import ReportByClient from "./ReportByClient";
import { PermissionGuard } from "../auth/pages/PermissionGuard";

const SearchSection = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-2">
      <Card title="Buscar productos" className="flex flex-col rounded-lg gap-5">
        <SearchProductForm />
      </Card>
      <PermissionGuard permissions={["REPORT_SALE_ORDER_BY_CLIENT"]}>
        <ReportByClient />
      </PermissionGuard>
    </div>
  );
};

export default SearchSection;
