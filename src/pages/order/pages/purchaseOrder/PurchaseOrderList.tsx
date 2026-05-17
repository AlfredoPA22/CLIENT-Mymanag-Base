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
import { DELETE_PURCHASE_ORDER } from "../../../../graphql/mutations/PurchaseOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_PURCHASE_ORDER_TO_PDF,
  LIST_PURCHASE_ORDER,
} from "../../../../graphql/queries/PurchaseOrder";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
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
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import useAuth from "../../../auth/hooks/useAuth";

const PurchaseOrderList = () => {
  const { listPurchaseOrder, loadingListPurchaseOrder } = usePurchaseOrderList();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();
  const client = useApolloClient();

  const MOBILE_PAGE_SIZE = 20;
  const [mobilePage, setMobilePage] = useState(1);

  const [DeletePurchaseOrder] = useMutation(DELETE_PURCHASE_ORDER, {
    refetchQueries: [{ query: LIST_PURCHASE_ORDER }, { query: LIST_PRODUCT }],
  });

  const statusBodyTemplate = (rowData: IPurchaseOrder) => {
    const status = getStatus(rowData.status);
    if (status) {
      return (
        <Tag severity={status.severity as "danger" | "success" | "info" | "warning"}>
          {status.label}
        </Tag>
      );
    }
    return null;
  };

  const dateBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.date) return <Tag>{getDate(rowData.date)}</Tag>;
    return null;
  };

  const providerBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.provider) {
      return <label>({rowData.provider.code}) {rowData.provider.name}</label>;
    }
    return null;
  };

  const tableHeaderTemplate = () => (
    <div className="flex justify-between items-center m-2 px-5">
      <h1 className="text-2xl font-bold">{`Lista de compras (${listPurchaseOrder.length})`}</h1>
      <Button
        id="btn-new-purchase"
        icon="pi pi-plus"
        severity="success"
        tooltip="Nueva compra"
        tooltipOptions={{ position: "left" }}
        onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.NEW_PURCHASE_ORDER}`)}
        raised
      />
    </div>
  );

  const handleDeletePurchaseOrder = async (purchaseOrderId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await DeletePurchaseOrder({ variables: { purchaseOrderId } });
      if (data.deletePurchaseOrder.success) {
        showToast({ detail: "Orden de compra eliminada.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmDeletePurchaseOrder = (purchaseOrderId: string) => {
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
      dispatch(setIsBlocked(true));
      const [{ data }, { data: dataCompany }] = await Promise.all([
        client.query({
          query: FIND_PURCHASE_ORDER_TO_PDF,
          variables: { purchaseOrderId },
          fetchPolicy: "network-only",
        }),
        client.query({ query: DETAIL_COMPANY, fetchPolicy: "network-only" }),
      ]);
      await generatePDF(data.findPurchaseOrderToPDF, dataCompany.detailCompany, currency);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
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
              onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/${rowData._id}`)}
            />
            <Button
              tooltip="Eliminar compra"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-trash"
              raised
              severity="danger"
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
              onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/${rowData._id}`)}
            />
            <Button
              tooltip="Imprimir compra"
              tooltipOptions={{ position: "left" }}
              icon="pi pi-download"
              raised
              severity="warning"
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
            onClick={() => handleGeneratePDF(rowData._id)}
          />
          <Button
            tooltip="Eliminar compra"
            tooltipOptions={{ position: "left" }}
            icon="pi pi-trash"
            raised
            severity="danger"
            onClick={() => confirmDeletePurchaseOrder(rowData._id)}
          />
        </div>
      );
    }
  };

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<IPurchaseOrder[]>) => {
    navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrder>[]>([
    { field: "code", header: "Codigo", sortable: true },
    { field: "date", header: "Fecha", body: dateBodyTemplate },
    { field: "provider.name", header: "Proveedor", sortable: true, body: providerBodyTemplate },
    { field: "created_by.user_name", header: "Usuario", sortable: true },
    {
      field: "total",
      header: "Total",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: IPurchaseOrder) => (
        <LabelInput className="justify-center" label={`${rowData.total} ${currency}`} />
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

  if (loadingListPurchaseOrder) return <LoadingSpinner />;

  return (
    <>
      {/* ── Mobile ─────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{`Compras (${listPurchaseOrder.length})`}</h1>
          <Button
            label="Nueva"
            icon="pi pi-plus"
            severity="success"
            size="small"
            raised
            onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.NEW_PURCHASE_ORDER}`)}
          />
        </div>

        {listPurchaseOrder.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin compras.</p>
        )}

        {listPurchaseOrder.slice(0, mobilePage * MOBILE_PAGE_SIZE).map((item: IPurchaseOrder) => {
          const status = getStatus(item.status);
          const isBorrador = item.status === orderStatus.BORRADOR;
          return (
            <div
              key={item._id}
              className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer active:bg-gray-50"
              onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${item._id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-bold text-gray-800 text-sm">{item.code}</span>
                {status && (
                  <Tag
                    severity={status.severity as "danger" | "success" | "info" | "warning"}
                    className="shrink-0"
                  >
                    {status.label}
                  </Tag>
                )}
              </div>
              <p className="text-sm text-gray-700 truncate">
                {item.provider ? `(${item.provider.code}) ${item.provider.name}` : "—"}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{getDate(item.date)}</span>
                <span>{item.created_by?.user_name}</span>
              </div>
              <p className="text-sm font-bold text-green-700 mt-1">
                {item.total} {currency}
              </p>
              <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                {isBorrador && (
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="info"
                    raised
                    onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/${item._id}`)}
                  />
                )}
                <Button
                  icon="pi pi-download"
                  size="small"
                  severity="warning"
                  raised
                  onClick={() => handleGeneratePDF(item._id)}
                />
                {(isBorrador && item.total === 0) || !isBorrador ? (
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    raised
                    onClick={() => confirmDeletePurchaseOrder(item._id)}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
        {mobilePage * MOBILE_PAGE_SIZE < listPurchaseOrder.length && (
          <Button
            label={`Cargar más (${listPurchaseOrder.length - mobilePage * MOBILE_PAGE_SIZE} restantes)`}
            icon="pi pi-chevron-down"
            severity="secondary"
            outlined
            className="w-full"
            onClick={() => setMobilePage((p) => p + 1)}
          />
        )}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <Card id="purchase-list-table" className="py-2 hidden md:block" header={tableHeaderTemplate}>
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
    </>
  );
};

export default PurchaseOrderList;
