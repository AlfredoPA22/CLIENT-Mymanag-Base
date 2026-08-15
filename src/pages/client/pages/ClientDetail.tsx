import { useQuery } from "@apollo/client";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../components/datatable/Table";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import TextLink from "../../../components/TextLink/TextLink";
import { LIST_SALE_ORDER_BY_CLIENT } from "../../../graphql/queries/Client";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IClient } from "../../../utils/interfaces/Client";
import { ISaleOrder } from "../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import { convertCurrency, formatAmount } from "../../../utils/currency";
import { getDate } from "../../order/utils/getDate";
import { getStatus } from "../../order/utils/getStatus";
import { ROUTES_MOCK } from "../../../routes/RouteMocks";
import useAuth from "../../auth/hooks/useAuth";

interface ClientDetailProps {
  client: IClient;
}

const statCardBase =
  "bg-white rounded-2xl border border-slate-100 border-t-4 shadow-sm p-4 flex flex-col gap-3";

const getInitials = (fullName: string) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const ClientDetail: FC<ClientDetailProps> = ({ client }) => {
  const {
    data: { listSaleOrderByClient: listSaleOrderByClient } = [],
    loading: loadingListSaleOrderByClient,
    error,
  } = useQuery(LIST_SALE_ORDER_BY_CLIENT, {
    variables: { clientId: client._id },
    fetchPolicy: "network-only",
  });

  const { currency } = useAuth();

  // Fuera de la sección de ventas, todo monto se muestra convertido a la
  // moneda de la empresa (aunque la nota se haya hecho en su moneda alterna)
  // para no mezclar Bs y $ en un mismo listado o reporte.
  const toCompanyAmount = (order: ISaleOrder) =>
    convertCurrency(order.total, order.currency ?? currency, currency, order.exchange_rate);

  const statusBodyTemplate = (rowData: ISaleOrder) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag severity={severity as "danger" | "success" | "info" | "warning"}>
          {label}
        </Tag>
      );
    }
    return null;
  };

  const saleOrderBodyTemplate = (rowData: ISaleOrder) => (
    <TextLink to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${rowData._id}`}>
      {rowData.code}
    </TextLink>
  );

  const [columns] = useState<DataTableColumn<ISaleOrder>[]>([
    {
      field: "code",
      header: "Código",
      sortable: true,
      style: { width: "25%" },
      body: saleOrderBodyTemplate,
    },
    {
      field: "date",
      header: "Fecha",
      sortable: true,
      style: { width: "20%" },
      body: (rowData: ISaleOrder) => (
        <span className="text-gray-600">{getDate(rowData.date)}</span>
      ),
    },
    {
      field: "total",
      header: "Total venta",
      sortable: true,
      style: { width: "25%", textAlign: "right" },
      body: (rowData: ISaleOrder) => (
        <span className="font-semibold text-gray-800">
          {formatAmount(toCompanyAmount(rowData))} {currency}
        </span>
      ),
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      style: { width: "20%", textAlign: "center" },
      body: statusBodyTemplate,
    },
  ]);

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Success });
    }
  }, [error]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListSaleOrderByClient) return <LoadingSpinner />;

  const saleOrders: ISaleOrder[] = listSaleOrderByClient?.saleOrder ?? [];
  // El backend devuelve `total` como String (GraphQL `String!`) — sumarle
  // Number.EPSILON dentro de formatAmount() sin convertirlo antes concatena
  // texto en vez de sumar, y Math.round() de esa cadena da NaN.
  const total = Number(listSaleOrderByClient?.total ?? 0);
  const averageTicket = saleOrders.length > 0 ? total / saleOrders.length : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Encabezado + resumen, en una sola fila en pantallas grandes ── */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
        <div className={`${statCardBase} border-t-blue-400 lg:flex-[1.3] flex-row items-center`}>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
            {getInitials(client.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-800 break-words">{client.fullName}</h2>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                {client.code}
              </span>
            </div>

            <div className="flex flex-col gap-y-1 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <i className="pi pi-phone text-slate-400 shrink-0" />
                <span>{client.phoneNumber || "Sin teléfono"}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <i className="pi pi-envelope text-slate-400 shrink-0" />
                <span className="break-all">{client.email || "Sin correo"}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <i className="pi pi-map-marker text-slate-400 shrink-0" />
                <span className="break-words">{client.address || "Sin dirección"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-3 lg:flex-[2]">
          <div className={`${statCardBase} border-t-teal-400 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <i className="pi pi-shopping-cart text-teal-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{saleOrders.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Ventas</p>
            </div>
          </div>

          <div className={`${statCardBase} border-t-[#A0C82E] lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-[#A0C82E]/10 flex items-center justify-center">
              <i className="pi pi-dollar text-[#A0C82E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatAmount(total)}
                <span className="text-sm font-medium text-slate-400 ml-1">{currency}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Total vendido</p>
            </div>
          </div>

          <div className={`${statCardBase} border-t-indigo-400 col-span-2 sm:col-span-1 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <i className="pi pi-chart-bar text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatAmount(averageTicket)}
                <span className="text-sm font-medium text-slate-400 ml-1">{currency}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Ticket promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Historial de ventas ────────────────────────────────── */}
      <Card className="bg-white shadow-lg rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Historial de ventas
        </h3>

        {/* ── Mobile: cards ─────────────────────────────── */}
        <div className="flex flex-col gap-2 md:hidden">
          {saleOrders.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">Sin ventas.</p>
          )}
          {saleOrders.map((order) => {
            const status = getStatus(order.status);
            return (
              <div
                key={order._id}
                className="flex items-center justify-between gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <TextLink to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${order._id}`}>
                    {order.code}
                  </TextLink>
                  <p className="text-xs text-gray-400 mt-0.5">{getDate(order.date)}</p>
                  <p className="text-sm font-semibold text-blue-600 mt-0.5">
                    {formatAmount(toCompanyAmount(order))} {currency}
                  </p>
                </div>
                {status && (
                  <Tag severity={status.severity as "danger" | "success" | "info" | "warning"} className="shrink-0">
                    {status.label}
                  </Tag>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Desktop: tabla ─────────────────────────────── */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={saleOrders}
            emptyMessage="Sin ventas."
            size="small"
            dataFilters={filters}
            tableHeader={renderFilterInput}
          />
        </div>
      </Card>
    </div>
  );
};

export default ClientDetail;
