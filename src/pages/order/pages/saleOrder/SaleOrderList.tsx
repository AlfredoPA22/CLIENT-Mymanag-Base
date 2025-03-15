import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { DELETE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_SALE_ORDER_TO_PDF,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import {
  ISaleOrder
} from "../../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import useSaleOrderList from "../../hooks/useSaleOrderList";
import { generatePDF } from "../../utils/generateSaleOrderPDF";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import { confirmDialog } from "primereact/confirmdialog";

const SaleOrderList = () => {
  const { listSaleOrder, loadingListSaleOrder } = useSaleOrderList();
  const navigate = useNavigate();

  const client = useApolloClient();

  const [DeleteSaleOrder] = useMutation(DELETE_SALE_ORDER, {
    refetchQueries: [
      {
        query: LIST_SALE_ORDER,
      },
      {
        query: LIST_PRODUCT,
      },
    ],
  });

  const statusBodyTemplate = (rowData: ISaleOrder) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag
          severity={
            severity as "secondary" | "success" | "info" | "warning" | "danger"
          }
        >
          {label}
        </Tag>
      );
    }
    return null;
  };

  const dateBodyTemplate = (rowData: ISaleOrder) => {
    if (rowData.date) {
      const date = getDate(rowData.date);
      return <Tag>{date}</Tag>;
    }
    return null;
  };

  const clientBodyTemplate = (rowData: ISaleOrder) => {
    if (rowData.client) {
      return (
        <label>
          ({rowData.client.code}) {rowData.client.firstName}{" "}
          {rowData.client.lastName}
        </label>
      );
    }
    return null;
  };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-end">
        <Button
          label="Nueva orden de venta"
          severity="success"
          onClick={() => navigate("/order/newSaleOrder")}
          rounded
        />
      </div>
    );
  };

  const handleDeleteSaleOrder = async (saleOrderId: string) => {
    try {
      const { data } = await DeleteSaleOrder({
        variables: {
          saleOrderId,
        },
      });
      if (data.deleteSaleOrder.success) {
        showToast({
          detail: "Orden de venta eliminada.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

   const confirmDeleteSaleOrder = async (saleOrderId: string) => {
      confirmDialog({
        message: "¿Esta seguro que desea eliminar la venta?",
        header: "Confirmacion",
        icon: "pi pi-info-circle",
        defaultFocus: "reject",
        acceptClassName: "p-button-danger",
        accept: () => handleDeleteSaleOrder(saleOrderId),
      });
    };

  const handleGeneratePDF = async (saleOrderId: string) => {
    try {
      const { data } = await client.query({
        query: FIND_SALE_ORDER_TO_PDF,
        variables: {
          saleOrderId,
        },
        fetchPolicy: "network-only",
      });

      generatePDF(data.findSaleOrderToPDF);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: ISaleOrder) => {
    if (rowData.status === orderStatus.BORRADOR) {
      if (rowData.total === 0) {
        return (
          <div className="flex justify-center gap-2">
            <Button
              tooltip="Completar venta"
              icon="pi pi-align-justify"
              rounded
              severity="info"
              aria-label="Cancel"
              onClick={() => navigate(`/order/editSaleOrder/${rowData._id}`)}
            />

            <Button
              tooltip="Eliminar venta"
              icon="pi pi-times"
              rounded
              severity="danger"
              aria-label="Cancel"
              onClick={() => confirmDeleteSaleOrder(rowData._id)}
            />
          </div>
        );
      } else {
        return (
          <div className="flex justify-center gap-2">
            <Button
              tooltip="Completar venta"
              icon="pi pi-align-justify"
              rounded
              severity="info"
              aria-label="Cancel"
              onClick={() => navigate(`/order/editSaleOrder/${rowData._id}`)}
            />
            <Button
              tooltip="Imprimir venta"
              icon="pi pi-download"
              rounded
              severity="warning"
              aria-label="Cancel"
              onClick={() => handleGeneratePDF(rowData._id)}
            />
          </div>
        );
      }
    } else {
      return (
        <div className="flex justify-center gap-2">
          <Button
            tooltip="Ver detalle de venta"
            icon="pi pi-eye"
            rounded
            severity="info"
            aria-label="Cancel"
            onClick={() => navigate(`/order/viewSaleOrder/${rowData._id}`)}
          />
          <Button
            tooltip="Imprimir venta"
            icon="pi pi-download"
            rounded
            severity="warning"
            aria-label="Cancel"
            onClick={() => handleGeneratePDF(rowData._id)}
          />
          <Button
            tooltip="Anular y eliminar venta"
            icon="pi pi-times"
            rounded
            severity="danger"
            aria-label="Cancel"
            onClick={() => confirmDeleteSaleOrder(rowData._id)}
          />
        </div>
      );
    }
  };

  const [columns] = useState<DataTableColumn<ISaleOrder>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
    },
    {
      field: "date",
      header: "Fecha",
      sortable: true,
      body: dateBodyTemplate,
    },
    {
      field: "client.firstName",
      header: "Cliente",
      sortable: true,
      body: clientBodyTemplate,
    },
    {
      field: "total",
      header: "Total",
      sortable: true,
      style: { textAlign: "center" },
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
      body: statusBodyTemplate,
      style: { textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  return (
    <Card
      className="size-full"
      title="Lista de Ventas"
      subTitle={tableHeaderTemplate}
    >
      {loadingListSaleOrder ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listSaleOrder}
            emptyMessage="Sin ventas."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
          />
        </div>
      )}
    </Card>
  );
};

export default SaleOrderList;
