import { useApolloClient } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { LIST_CLIENT } from "../../../graphql/queries/Client";
import { LIST_LOW_STOCK_PRODUCT } from "../../../graphql/queries/Product";
import useAuth from "../../auth/hooks/useAuth";
import ProductReportFilter from "./ProductReportFilter";
import PurchaseOrderReportFilter from "./PurchaseOrderReportFilter";
import SaleOrderReportFilter from "./SaleOrderReportFilter";
import InventoryValueReportFilter from "./InventoryValueReportFilter";
import CuentasCobrarReportFilter from "./CuentasCobrarReportFilter";
import { generateLowStockReportPDF } from "../utils/generateLowStockReportPDF";
import { generateClientReportPDF } from "../utils/generateClientReportPDF";

const ReportsPage = () => {
  const [visibleProductFilter, setVisibleProductFilter] = useState(false);
  const [visiblePurchaseOrderFilter, setVisiblePurchaseOrderFilter] = useState(false);
  const [visibleSaleOrderFilter, setVisibleSaleOrderFilter] = useState(false);
  const [visibleInventoryValue, setVisibleInventoryValue] = useState(false);
  const [visibleCuentasCobrar, setVisibleCuentasCobrar] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  const { permissions } = useAuth();
  const apolloClient = useApolloClient();

  const canAccess = (perms: string[], required: string) => perms.includes(required);

  const handleLowStockReport = async () => {
    setLoadingLowStock(true);
    try {
      const { data } = await apolloClient.query({
        query: LIST_LOW_STOCK_PRODUCT,
        fetchPolicy: "network-only",
      });
      if (data?.listLowStockProduct) {
        generateLowStockReportPDF(data.listLowStockProduct);
      }
    } finally {
      setLoadingLowStock(false);
    }
  };

  const handleClientReport = async () => {
    setLoadingClients(true);
    try {
      const { data } = await apolloClient.query({
        query: LIST_CLIENT,
        fetchPolicy: "network-only",
      });
      if (data?.listClient) {
        generateClientReportPDF(data.listClient);
      }
    } finally {
      setLoadingClients(false);
    }
  };

  const reportGroups = [
    {
      label: "Inventario",
      icon: "pi pi-box",
      color: "bg-indigo-50 border-indigo-100",
      iconColor: "text-indigo-500",
      reports: [
        {
          label: "Reporte de Productos",
          icon: "pi pi-list",
          permission: "PRODUCT_REPORT",
          onClick: () => setVisibleProductFilter(true),
        },
        {
          label: "Inventario Valorizado",
          icon: "pi pi-dollar",
          permission: "PRODUCT_REPORT",
          onClick: () => setVisibleInventoryValue(true),
        },
        {
          label: "Productos con Bajo Stock",
          icon: "pi pi-exclamation-triangle",
          permission: "PRODUCT_REPORT",
          onClick: handleLowStockReport,
          loading: loadingLowStock,
        },
      ],
    },
    {
      label: "Ventas",
      icon: "pi pi-shopping-cart",
      color: "bg-teal-50 border-teal-100",
      iconColor: "text-teal-500",
      reports: [
        {
          label: "Reporte de Ventas",
          icon: "pi pi-chart-bar",
          permission: "SALE_ORDER_REPORT",
          onClick: () => setVisibleSaleOrderFilter(true),
        },
        {
          label: "Cuentas por Cobrar",
          icon: "pi pi-credit-card",
          permission: "SALE_ORDER_REPORT",
          onClick: () => setVisibleCuentasCobrar(true),
        },
        {
          label: "Reporte de Clientes",
          icon: "pi pi-users",
          permission: "SALE_ORDER_REPORT",
          onClick: handleClientReport,
          loading: loadingClients,
        },
      ],
    },
    {
      label: "Compras",
      icon: "pi pi-truck",
      color: "bg-amber-50 border-amber-100",
      iconColor: "text-amber-500",
      reports: [
        {
          label: "Reporte de Compras",
          icon: "pi pi-chart-bar",
          permission: "PURCHASE_ORDER_REPORT",
          onClick: () => setVisiblePurchaseOrderFilter(true),
        },
      ],
    },
  ];

  return (
    <Card title="Reportes">
      <div className="flex flex-col gap-4">
        {reportGroups.map((group) => {
          const visibleReports = group.reports.filter((r) =>
            canAccess(permissions, r.permission)
          );
          if (visibleReports.length === 0) return null;

          return (
            <div
              key={group.label}
              className={`border rounded-xl p-4 ${group.color}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <i className={`${group.icon} ${group.iconColor} text-base`} />
                <span className="text-sm font-semibold text-slate-700">
                  {group.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleReports.map((report) => (
                  <Button
                    key={report.label}
                    label={report.label}
                    icon={report.icon}
                    onClick={report.onClick}
                    loading={"loading" in report ? report.loading : false}
                    className="p-button-outlined p-button-sm"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      <Dialog
        className="md:w-[50vw] w-[90vw]"
        header="Reporte de productos"
        visible={visibleProductFilter}
        onHide={() => setVisibleProductFilter(false)}
      >
        <ProductReportFilter setVisibleProductFilter={setVisibleProductFilter} />
      </Dialog>

      <Dialog
        className="xl:w-[50vw] w-[90vw]"
        header="Reporte de compras"
        visible={visiblePurchaseOrderFilter}
        onHide={() => setVisiblePurchaseOrderFilter(false)}
      >
        <PurchaseOrderReportFilter
          setVisiblePurchaseOrderFilter={setVisiblePurchaseOrderFilter}
        />
      </Dialog>

      <Dialog
        className="xl:w-[50vw] w-[90vw]"
        header="Reporte de ventas"
        visible={visibleSaleOrderFilter}
        onHide={() => setVisibleSaleOrderFilter(false)}
      >
        <SaleOrderReportFilter setVisibleSaleOrderFilter={setVisibleSaleOrderFilter} />
      </Dialog>

      <Dialog
        className="xl:w-[50vw] w-[90vw]"
        header="Inventario valorizado"
        visible={visibleInventoryValue}
        onHide={() => setVisibleInventoryValue(false)}
      >
        <InventoryValueReportFilter setVisible={setVisibleInventoryValue} />
      </Dialog>

      <Dialog
        className="xl:w-[50vw] w-[90vw]"
        header="Cuentas por cobrar"
        visible={visibleCuentasCobrar}
        onHide={() => setVisibleCuentasCobrar(false)}
      >
        <CuentasCobrarReportFilter setVisible={setVisibleCuentasCobrar} />
      </Dialog>
    </Card>
  );
};

export default ReportsPage;
