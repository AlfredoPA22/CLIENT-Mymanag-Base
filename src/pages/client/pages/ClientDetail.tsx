import { useQuery } from "@apollo/client";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../components/datatable/Table";
import LabelInput from "../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import TextLink from "../../../components/TextLink/TextLink";
import { LIST_SALE_ORDER_BY_CLIENT } from "../../../graphql/queries/Client";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IClient } from "../../../utils/interfaces/Client";
import { ISaleOrder } from "../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import { getStatus } from "../../order/utils/getStatus";
import { ROUTES_MOCK } from "../../../routes/RouteMocks";
import useAuth from "../../auth/hooks/useAuth";

interface ClientDetailProps {
  client: IClient;
}

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

  const header = (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:flex-wrap">
      {/* Nombre y código */}
      <div className="flex items-center gap-3">
        <i className="pi pi-user text-2xl text-blue-500 shrink-0" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 break-words">{client.fullName}</h2>
          <p className="text-sm text-gray-500">Código: {client.code}</p>
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4 text-gray-700 text-sm">
        {client.phoneNumber && (
          <div className="flex items-center gap-1">
            <i className="pi pi-phone text-blue-500 shrink-0" />
            <span>{client.phoneNumber}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-1 min-w-0">
            <i className="pi pi-envelope text-blue-500 shrink-0" />
            <span className="break-all">{client.email}</span>
          </div>
        )}
        {client.address && (
          <div className="flex items-center gap-1 min-w-0">
            <i className="pi pi-map-marker text-blue-500 shrink-0" />
            <span className="break-words">{client.address}</span>
          </div>
        )}
      </div>
    </div>
  );

  const [columns] = useState<DataTableColumn<ISaleOrder>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
      style: { width: "30%" },
      body: saleOrderBodyTemplate,
    },
    {
      field: "total",
      header: "Total venta",
      sortable: true,
      style: { width: "30%" },
      body: (rowData: ISaleOrder) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.total} ${currency}`}
        />
      ),
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      style: { width: "30%" },
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
  const total = listSaleOrderByClient?.total ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <Card header={header} className="shadow-lg rounded-2xl border-none p-4" />

      {listSaleOrderByClient && (
        <Card className="bg-white shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Lista de ventas ({saleOrders.length})
            </h3>
          </div>

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
                    <p className="text-sm font-semibold text-blue-600 mt-0.5">
                      {order.total} {currency}
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
            {saleOrders.length > 0 && (
              <p className="text-right text-sm font-semibold text-gray-700 pr-1">
                Total vendido: {total} {currency}
              </p>
            )}
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
              footer={`Total vendido: ${total} ${currency}`}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClientDetail;
