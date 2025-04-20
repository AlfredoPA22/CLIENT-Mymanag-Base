import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
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
import { ISaleOrder } from "../../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import useSaleOrderList from "../../hooks/useSaleOrderList";
import { generatePDF } from "../../utils/generateSaleOrderPDF";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";

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
          ({rowData.client.code}) {rowData.client.fullName}
        </label>
      );
    }
    return null;
  };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de ventas (${listSaleOrder.length})`}</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nueva venta"
          tooltipOptions={{ position: "left" }}
          onClick={() => navigate("/order/newSaleOrder")}
          raised
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
      rejectLabel: "Cancelar",
      acceptLabel: "Aceptar",
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
              tooltipOptions={{ position: "left" }}
              icon="pi pi-pencil"
              raised
              severity="info"
              aria-label="Cancel"
              onClick={() => navigate(`/order/editSaleOrder/${rowData._id}`)}
            />

            <Button
              tooltip="Eliminar venta"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-trash"
              raised
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
              tooltipOptions={{ position: "left" }}
              icon="pi pi-pencil"
              raised
              severity="info"
              aria-label="Cancel"
              onClick={() => navigate(`/order/editSaleOrder/${rowData._id}`)}
            />
            <Button
              tooltip="Imprimir venta"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-download"
              raised
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
            tooltip="Imprimir venta"
            tooltipOptions={{ position: "left" }}
            icon="pi pi-download"
            raised
            severity="warning"
            aria-label="Cancel"
            onClick={() => handleGeneratePDF(rowData._id)}
          />
          <Button
            tooltip="Anular y eliminar venta"
            tooltipOptions={{ position: "left" }}
            icon="pi pi-trash"
            raised
            severity="danger"
            aria-label="Cancel"
            onClick={() => confirmDeleteSaleOrder(rowData._id)}
          />
        </div>
      );
    }
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<ISaleOrder[]>
  ) => {
    navigate(`/order/viewSaleOrder/${e.value._id}`);
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
      field: "created_by.user_name",
      header: "Usuario",
      sortable: true,
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

  if (loadingListSaleOrder) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listSaleOrder}
        emptyMessage="Sin ventas."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        onSelectionChange={handleSelectionChange}
      />
    </Card>
  );
};

export default SaleOrderList;
