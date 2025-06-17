import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { DELETE_PURCHASE_ORDER } from "../../../../graphql/mutations/PurchaseOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_PURCHASE_ORDER_TO_PDF,
  LIST_PURCHASE_ORDER,
} from "../../../../graphql/queries/PurchaseOrder";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IPurchaseOrder } from "../../../../utils/interfaces/PurchaseOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import usePurchaseOrderList from "../../hooks/usePurchaseOrderList";
import { generatePDF } from "../../utils/generatePurchaseOrderPDF";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import { Card } from "primereact/card";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import useAuth from "../../../auth/hooks/useAuth";

const PurchaseOrderList = () => {
  const { listPurchaseOrder, loadingListPurchaseOrder } =
    usePurchaseOrderList();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const client = useApolloClient();

  const [DeletePurchaseOrder] = useMutation(DELETE_PURCHASE_ORDER, {
    refetchQueries: [
      {
        query: LIST_PURCHASE_ORDER,
      },
      {
        query: LIST_PRODUCT,
      },
    ],
  });

  const statusBodyTemplate = (rowData: IPurchaseOrder) => {
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

  const dateBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.date) {
      const date = getDate(rowData.date);
      return <Tag>{date}</Tag>;
    }
    return null;
  };

  const prodiverBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.provider) {
      return (
        <label>
          ({rowData.provider.code}) {rowData.provider.name}
        </label>
      );
    }
    return null;
  };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de compras (${listPurchaseOrder.length})`}</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nueva compra"
          tooltipOptions={{ position: "left" }}
          onClick={() =>
            navigate(
              `${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.NEW_PURCHASE_ORDER}`
            )
          }
          raised
        />
      </div>
    );
  };

  const handleDeletePurchaseOrder = async (purchaseOrderId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await DeletePurchaseOrder({
        variables: {
          purchaseOrderId,
        },
      });
      if (data.deletePurchaseOrder.success) {
        showToast({
          detail: "Orden de compra eliminada.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmDeletePurchaseOrder = async (purchaseOrderId: string) => {
    confirmDialog({
      message: "¿Esta seguro que desea eliminar la compra?",
      header: "Confirmacion",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => handleDeletePurchaseOrder(purchaseOrderId),
    });
  };

  const handleGeneratePDF = async (purchaseOrderId: string) => {
    try {
      const { data } = await client.query({
        query: FIND_PURCHASE_ORDER_TO_PDF,
        variables: {
          purchaseOrderId,
        },
        fetchPolicy: "network-only",
      });

      generatePDF(data.findPurchaseOrderToPDF);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.status === orderStatus.BORRADOR) {
      if (rowData.total === 0) {
        return (
          <div className="flex justify-center gap-2">
            <Button
              tooltip="Completar compra"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-pencil"
              raised
              severity="info"
              aria-label="Cancel"
              onClick={() =>
                navigate(
                  `${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/${rowData._id}`
                )
              }
            />

            <Button
              tooltip="Eliminar compra"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-trash"
              raised
              severity="danger"
              aria-label="Cancel"
              onClick={() => confirmDeletePurchaseOrder(rowData._id)}
            />
          </div>
        );
      } else {
        return (
          <div className="flex justify-center gap-2">
            <Button
              tooltip="Completar compra"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-pencil"
              raised
              severity="info"
              aria-label="Cancel"
              onClick={() =>
                navigate(
                  `${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/${rowData._id}`
                )
              }
            />

            <Button
              tooltip="Imprimir compra"
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
            tooltip="Imprimir compra"
            tooltipOptions={{ position: "left" }}
            icon="pi pi-download"
            raised
            severity="warning"
            aria-label="Cancel"
            onClick={() => handleGeneratePDF(rowData._id)}
          />

          <Button
            tooltip="Eliminar compra"
            tooltipOptions={{ position: "left" }}
            icon="pi pi-trash"
            raised
            severity="danger"
            aria-label="Cancel"
            onClick={() => confirmDeletePurchaseOrder(rowData._id)}
          />
        </div>
      );
    }
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IPurchaseOrder[]>
  ) => {
    navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrder>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
    },
    {
      field: "date",
      header: "Fecha",
      body: dateBodyTemplate,
    },
    {
      field: "provider.name",
      header: "Proveedor",
      sortable: true,
      body: prodiverBodyTemplate,
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
      body: (rowData: IPurchaseOrder) => (
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
      body: statusBodyTemplate,
      style: { textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListPurchaseOrder) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listPurchaseOrder}
        emptyMessage="Sin compras."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        onSelectionChange={handleSelectionChange}
      />
    </Card>
  );
};

export default PurchaseOrderList;
