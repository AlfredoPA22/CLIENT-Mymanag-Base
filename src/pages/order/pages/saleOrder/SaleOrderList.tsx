import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { DELETE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_SALE_ORDER_TO_PDF,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { paymentMethod } from "../../../../utils/enums/paymentMethod.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { ISaleOrder } from "../../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import useAuth from "../../../auth/hooks/useAuth";
import useSaleOrderList from "../../hooks/useSaleOrderList";
import { generatePDF } from "../../utils/generateSaleOrderPDF";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";

const SaleOrderList = () => {
  const { listSaleOrder, loadingListSaleOrder } = useSaleOrderList();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

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
          id="btn-new-sale"
          icon="pi pi-plus"
          severity="success"
          tooltip="Nueva venta"
          tooltipOptions={{ position: "left" }}
          onClick={() =>
            navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.NEW_SALE_ORDER}`)
          }
          raised
        />
      </div>
    );
  };

  const handleDeleteSaleOrder = async (saleOrderId: string) => {
    try {
      dispatch(setIsBlocked(true));
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
    } finally {
      dispatch(setIsBlocked(false));
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
      dispatch(setIsBlocked(true));
      const { data } = await client.query({
        query: FIND_SALE_ORDER_TO_PDF,
        variables: {
          saleOrderId,
        },
        fetchPolicy: "network-only",
      });

      const { data: dataCompany } = await client.query({
        query: DETAIL_COMPANY,
        fetchPolicy: "network-only",
      });

      generatePDF(data.findSaleOrderToPDF, dataCompany.detailCompany, currency);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
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
              onClick={() =>
                navigate(
                  `${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.EDIT_SALE_ORDER}/${rowData._id}`
                )
              }
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
              onClick={() =>
                navigate(
                  `${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.EDIT_SALE_ORDER}/${rowData._id}`
                )
              }
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

          {rowData.payment_method === paymentMethod.CREDITO && (
            <Button
              tooltip="Ver Pagos"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-wallet"
              raised
              severity="info"
              aria-label="Cancel"
              onClick={() =>
                navigate(
                  `${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.SALE_PAYMENT}/${rowData._id}`
                )
              }
            />
          )}

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
    navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${e.value._id}`);
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
      field: "payment_method",
      header: "Metodo de pago",
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
    {
      field: "is_paid",
      header: "Estado de pago",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData) => {
        if (rowData.status !== orderStatus.APROBADO) {
          return <span style={{ color: "#6B7280" }}>Borrador</span>;
        }
        return rowData.is_paid ? (
          <span style={{ color: "green" }}>Pagada</span>
        ) : (
          <span style={{ color: "red" }}>Pendiente</span>
        );
      },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListSaleOrder) {
    return <LoadingSpinner />;
  }

  return (
    <Card id="sale-list-table" className="py-2" header={tableHeaderTemplate}>
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
