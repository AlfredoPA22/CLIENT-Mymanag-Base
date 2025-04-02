import { useQuery } from "@apollo/client";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../components/datatable/Table";
import LabelInput from "../../../components/labelInput/LabelInput";
import TextLink from "../../../components/TextLink/TextLink";
import { LIST_SALE_ORDER_BY_CLIENT } from "../../../graphql/queries/Client";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { currencySymbol } from "../../../utils/constants/currencyConstants";
import { orderStatus } from "../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IClient } from "../../../utils/interfaces/Client";
import { ISaleOrder } from "../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import { getStatus } from "../../order/utils/getStatus";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

interface ClientSaleOrderListProps {
  client: IClient;
}

const ClientSaleOrderList: FC<ClientSaleOrderListProps> = ({ client }) => {
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
    if (rowData.status === orderStatus.APROBADO) {
      return (
        <TextLink
          link={`/order/viewSaleOrder/${rowData._id}`}
          text={rowData.code}
        />
      );
    } else {
      return (
        <TextLink
          link={`/order/editSaleOrder/${rowData._id}`}
          text={rowData.code}
        />
      );
    }
  };

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
      <Table
        columns={columns}
        data={listSaleOrderByClient.saleOrder}
        emptyMessage="Sin ventas."
        size="small"
        dataFilters={filters}
        tableHeader={renderFilterInput}
        footer={`Total vendido: ${listSaleOrderByClient.total} ${currencySymbol}`}
      />
  );
};

export default ClientSaleOrderList;
