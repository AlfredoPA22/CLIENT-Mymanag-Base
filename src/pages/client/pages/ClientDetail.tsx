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
import { currencySymbol } from "../../../utils/constants/currencyConstants";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IClient } from "../../../utils/interfaces/Client";
import { ISaleOrder } from "../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import { getStatus } from "../../order/utils/getStatus";
import { ROUTES_MOCK } from "../../../routes/RouteMocks";

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

  const saleOrderBodyTemplate = (rowData: ISaleOrder) => {
    return (
      <TextLink
        link={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${rowData._id}`}
        text={rowData.code}
      />
    );
  };

  const header = (
    <div className="flex items-center justify-between flex-wrap">
      {/* Izquierda: nombre y código */}
      <div className="flex items-center space-x-3">
        <i className="pi pi-user text-2xl text-blue-500"></i>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {client.fullName}
          </h2>
          <p className="text-sm text-gray-500">Código: {client.code}</p>
        </div>
      </div>

      {/* Derecha: otros datos */}
      <div className="flex items-center space-x-4 text-gray-700 text-sm mt-2 md:mt-0">
        <div className="flex items-center">
          <i className="pi pi-map-marker mr-1 text-blue-500" />
          <span>{client.address}</span>
        </div>
        <div className="flex items-center">
          <i className="pi pi-envelope mr-1 text-blue-500" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center">
          <i className="pi pi-phone mr-1 text-blue-500" />
          <span>{client.phoneNumber}</span>
        </div>
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
          label={`${rowData.total} ${currencySymbol}`}
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
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListSaleOrderByClient) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col gap-2">
      <Card header={header} className="shadow-lg rounded-2xl border-none p-4" />

      {listSaleOrderByClient && (
        <Card className="bg-white shadow-lg rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Lista de ventas ({listSaleOrderByClient.saleOrder.length})
            </h3>
          </div>

          <Table
            columns={columns}
            data={listSaleOrderByClient.saleOrder}
            emptyMessage="Sin ventas."
            size="small"
            dataFilters={filters}
            tableHeader={renderFilterInput}
            footer={`Total vendido: ${listSaleOrderByClient.total} ${currencySymbol}`}
          />
        </Card>
      )}
    </div>
  );
};

export default ClientDetail;
