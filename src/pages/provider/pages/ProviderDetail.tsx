import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/datatable/Table";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { ROUTES_MOCK } from "../../../routes/RouteMocks";
import { IProvider } from "../../../utils/interfaces/Provider";
import { IPurchaseOrder } from "../../../utils/interfaces/PurchaseOrder";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { getDate } from "../../order/utils/getDate";
import { getStatus } from "../../order/utils/getStatus";
import useListPurchaseOrderByProvider from "../hooks/useListPurchaseOrderByProvider";
import useAuth from "../../auth/hooks/useAuth";
import { formatAmount } from "../../../utils/currency";

interface ProviderDetailProps {
  provider: IProvider;
}

const statCardBase =
  "bg-white rounded-2xl border border-slate-100 border-t-4 shadow-sm p-4 flex flex-col gap-3";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const ProviderDetail: FC<ProviderDetailProps> = ({ provider }) => {
  const { currency } = useAuth();
  const navigate = useNavigate();
  const { listPurchaseOrderByProvider, loadingListPurchaseOrderByProvider } =
    useListPurchaseOrderByProvider(provider._id);

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IPurchaseOrder[]>
  ) => {
    navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrder>[]>([
    { field: "code", header: "Código", sortable: true, style: { width: "20%" } },
    {
      field: "date",
      header: "Fecha",
      sortable: true,
      style: { width: "20%" },
      body: (rowData: IPurchaseOrder) => (
        <span className="text-gray-600">{getDate(rowData.date)}</span>
      ),
    },
    {
      field: "total",
      header: "Total",
      sortable: true,
      style: { width: "20%", textAlign: "right" },
      body: (rowData: IPurchaseOrder) => (
        <span className="font-semibold text-gray-800">
          {formatAmount(rowData.total)} {currency}
        </span>
      ),
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      style: { width: "20%", textAlign: "center" },
      body: (rowData: IPurchaseOrder) => {
        const status = getStatus(rowData.status);
        return status ? (
          <Tag severity={status.severity as "danger" | "success"}>{status.label}</Tag>
        ) : null;
      },
    },
  ]);

  if (loadingListPurchaseOrderByProvider) {
    return <LoadingSpinner />;
  }

  const purchaseOrders: IPurchaseOrder[] = listPurchaseOrderByProvider ?? [];
  const totalPurchased = purchaseOrders.reduce((acc, o) => acc + (o.total ?? 0), 0);
  const avgTicket = purchaseOrders.length > 0 ? totalPurchased / purchaseOrders.length : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Encabezado + resumen, en una sola fila en pantallas grandes ── */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
        <div className={`${statCardBase} border-t-indigo-400 lg:flex-[1.3] flex-row items-center`}>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold shrink-0">
            {getInitials(provider.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-800 break-words">{provider.name}</h2>
              {provider.code && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                  {provider.code}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <i className="pi pi-map-marker text-xs" />
                {provider.address || "Sin dirección"}
              </span>
              <span className="flex items-center gap-1">
                <i className="pi pi-phone text-xs" />
                {provider.phoneNumber || "Sin teléfono"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-3 lg:flex-[2]">
          <div className={`${statCardBase} border-t-teal-400 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <i className="pi pi-file text-teal-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{purchaseOrders.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Compras</p>
            </div>
          </div>

          <div className={`${statCardBase} border-t-sky-400 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <i className="pi pi-dollar text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatAmount(totalPurchased)}
                <span className="text-sm font-medium text-slate-400 ml-1">{currency}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Total comprado</p>
            </div>
          </div>

          <div className={`${statCardBase} border-t-[#A0C82E] col-span-2 sm:col-span-1 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-[#A0C82E]/10 flex items-center justify-center">
              <i className="pi pi-chart-line text-[#A0C82E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatAmount(avgTicket)}
                <span className="text-sm font-medium text-slate-400 ml-1">{currency}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Ticket promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Compras del proveedor ──────────────────────────────── */}
      <Card className="bg-white shadow-lg rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Compras a este proveedor
        </h3>

        {/* ── Mobile: cards ─────────────────────────────────── */}
        <div className="flex flex-col gap-2 md:hidden">
          {purchaseOrders.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">
              No se registran compras a este proveedor.
            </p>
          )}
          {purchaseOrders.map((order) => {
            const status = getStatus(order.status);
            return (
              <div
                key={order._id}
                className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer transition-colors duration-150 active:bg-gray-50"
                onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${order._id}`)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-sm">{order.code}</span>
                  {status && (
                    <Tag severity={status.severity as "danger" | "success"}>{status.label}</Tag>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{getDate(order.date)}</span>
                  <span className="font-semibold text-blue-700 text-sm">
                    {formatAmount(order.total)} {currency}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop: tabla ─────────────────────────────────── */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={purchaseOrders}
            emptyMessage="No se registran compras a este proveedor."
            size="small"
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </Card>
    </div>
  );
};

export default ProviderDetail;
