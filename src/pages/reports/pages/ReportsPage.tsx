import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import ProductReportFilter from "./ProductReportFilter";
import PurchaseOrderReportFilter from "./PurchaseOrderReportFilter";
import SaleOrderReportFilter from "./SaleOrderReportFilter";

const ReportsPage = () => {
  const [visibleProductFilter, setVisibleProductFilter] = useState(false);
  const [visiblePurchaseOrderFilter, setVisiblePurchaseOrderFilter] =
    useState(false);
  const [visibleSaleOrderFilter, setVisibleSaleOrderFilter] = useState(false);

  return (
    <Card title="Reportes">
      <div className="flex lg:flex-row flex-col gap-2">
        <Button
          label="Reporte de Productos"
          icon="pi pi-box"
          onClick={() => setVisibleProductFilter(true)}
          className="p-button-outlined p-mb-2"
        />
        <Button
          label="Reporte de Compras"
          icon="pi pi-chart-bar"
          onClick={() => setVisiblePurchaseOrderFilter(true)}
          className="p-button-outlined p-mb-2"
        />
        <Button
          label="Reporte de Ventas"
          icon="pi pi-chart-bar"
          onClick={() => setVisibleSaleOrderFilter(true)}
          className="p-button-outlined p-mb-2"
        />
      </div>

      <Dialog
        className="md:w-[50vw] w-[90vw]"
        header="Generar reporte de productos"
        visible={visibleProductFilter}
        onHide={() => setVisibleProductFilter(false)}
      >
        <ProductReportFilter
          setVisibleProductFilter={setVisibleProductFilter}
        />
      </Dialog>

      <Dialog
        className="xl:w-[50vw] w-[90vw]"
        header="Generar reporte de compras"
        visible={visiblePurchaseOrderFilter}
        onHide={() => setVisiblePurchaseOrderFilter(false)}
      >
        <PurchaseOrderReportFilter
          setVisiblePurchaseOrderFilter={setVisiblePurchaseOrderFilter}
        />
      </Dialog>

      <Dialog
        className="xl:w-[50vw] w-[90vw]"
        header="Generar reporte de ventas"
        visible={visibleSaleOrderFilter}
        onHide={() => setVisibleSaleOrderFilter(false)}
      >
        <SaleOrderReportFilter
          setVisibleSaleOrderFilter={setVisibleSaleOrderFilter}
        />
      </Dialog>
    </Card>
  );
};

export default ReportsPage;
