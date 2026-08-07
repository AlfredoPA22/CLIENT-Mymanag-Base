import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import RowActionButtons, { RowAction } from "../../../../components/table/RowActionButtons";
import { DELETE_PURCHASE_ORDER } from "../../../../graphql/mutations/PurchaseOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_PURCHASE_ORDER_TO_PDF,
  LIST_PURCHASE_ORDER,
} from "../../../../graphql/queries/PurchaseOrder";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IPurchaseOrder } from "../../../../utils/interfaces/PurchaseOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import usePurchaseOrderList from "../../hooks/usePurchaseOrderList";
import { generatePDF } from "../../utils/generatePurchaseOrderPDF";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import { formatAmount } from "../../../../utils/currency";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import useAuth from "../../../auth/hooks/useAuth";

const STATUS_OPTIONS = [
  { label: "Borrador", value: orderStatus.BORRADOR },
  { label: "Aprobado", value: orderStatus.APROBADO },
  { label: "Cancelado", value: orderStatus.CANCELADO },
];

const DROPDOWN_PANEL_PROPS = {
  panelStyle: { maxWidth: "95vw" },
  panelClassName: "[&_.p-dropdown-item]:whitespace-normal [&_.p-dropdown-item]:leading-snug",
};

const PurchaseOrderList = () => {
  const { listPurchaseOrder, loadingListPurchaseOrder } = usePurchaseOrderList();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();
  const client = useApolloClient();

  const MOBILE_PAGE_SIZE = 20;
  const [mobilePage, setMobilePage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Filter state ──────────────────────────────────────────────
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [providerFilter, setProviderFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasActiveFilter =
    !!startDate || !!endDate || !!providerFilter || !!sellerFilter || !!statusFilter;

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setProviderFilter("");
    setSellerFilter("");
    setStatusFilter("");
  };

  const providerOptions = useMemo(() => {
    const names = [...new Set(
      (listPurchaseOrder ?? []).map((o: IPurchaseOrder) => o.provider?.name).filter(Boolean)
    )];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [listPurchaseOrder]);

  const sellerOptions = useMemo(() => {
    const names = [...new Set(
      (listPurchaseOrder ?? []).map((o: IPurchaseOrder) => o.created_by?.user_name).filter(Boolean)
    )];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [listPurchaseOrder]);

  const filteredData = useMemo(() => {
    if (!listPurchaseOrder) return [];
    return listPurchaseOrder.filter((order: IPurchaseOrder) => {
      const orderDate = new Date(Number(order.date));
      if (startDate) { const s = new Date(startDate); s.setHours(0, 0, 0, 0); if (orderDate < s) return false; }
      if (endDate) { const e = new Date(endDate); e.setHours(23, 59, 59, 999); if (orderDate > e) return false; }
      if (providerFilter && order.provider?.name !== providerFilter) return false;
      if (sellerFilter && order.created_by?.user_name !== sellerFilter) return false;
      if (statusFilter && order.status !== statusFilter) return false;
      return true;
    });
  }, [listPurchaseOrder, startDate, endDate, providerFilter, sellerFilter, statusFilter]);

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
      <h1 className="text-2xl font-bold">{`Lista de compras (${filteredData.length})`}</h1>
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

  const buildPurchaseOrderActions = (rowData: IPurchaseOrder): RowAction[] => {
    const isBorrador = rowData.status === orderStatus.BORRADOR;
    const actions: RowAction[] = [];

    if (isBorrador) {
      actions.push({
        label: "Completar compra",
        icon: "pi pi-pencil",
        severity: "info",
        onClick: () => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/${rowData._id}`),
      });
    }
    if (!isBorrador || rowData.total > 0) {
      actions.push({
        label: "Imprimir compra",
        icon: "pi pi-download",
        severity: "warning",
        onClick: () => handleGeneratePDF(rowData._id),
      });
    }
    if (!isBorrador || rowData.total === 0) {
      actions.push({
        label: "Eliminar compra",
        icon: "pi pi-trash",
        severity: "danger",
        onClick: () => confirmDeletePurchaseOrder(rowData._id),
      });
    }

    return actions;
  };

  const actionBodyTemplate = (rowData: IPurchaseOrder) => (
    <RowActionButtons actions={buildPurchaseOrderActions(rowData)} />
  );

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
        <LabelInput className="justify-center" label={`${formatAmount(rowData.total)} ${currency}`} />
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

  if (loadingListPurchaseOrder) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-3 p-3 md:p-0">

      {/* ── Panel de filtros ───────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div
          className="flex items-center justify-between p-4 cursor-pointer select-none"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="pi pi-filter text-slate-500" />
            Filtros
            {hasActiveFilter && (
              <Tag severity="info" className="text-xs">
                {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}
              </Tag>
            )}
          </span>
          <div className="flex items-center gap-2">
            {hasActiveFilter && (
              <Button
                label="Limpiar"
                icon="pi pi-times"
                size="small"
                severity="secondary"
                outlined
                onClick={(e) => { e.stopPropagation(); clearFilters(); }}
              />
            )}
            <i className={`pi pi-chevron-down transition-transform duration-200 text-slate-400 ${filtersOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
         <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Fecha inicio</label>
              <Calendar value={startDate} onChange={(e) => setStartDate(e.value as Date | null)}
                dateFormat="dd/mm/yy" placeholder="Desde" showIcon showButtonBar inputClassName="text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Fecha fin</label>
              <Calendar value={endDate} onChange={(e) => setEndDate(e.value as Date | null)}
                dateFormat="dd/mm/yy" placeholder="Hasta" showIcon showButtonBar inputClassName="text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Proveedor</label>
              <Dropdown value={providerFilter} options={providerOptions} onChange={(e) => setProviderFilter(e.value)}
                placeholder="Todos" showClear filter className="w-full text-sm" {...DROPDOWN_PANEL_PROPS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Usuario</label>
              <Dropdown value={sellerFilter} options={sellerOptions} onChange={(e) => setSellerFilter(e.value)}
                placeholder="Todos" showClear className="w-full text-sm" {...DROPDOWN_PANEL_PROPS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Estado</label>
              <Dropdown value={statusFilter} options={STATUS_OPTIONS} onChange={(e) => setStatusFilter(e.value)}
                placeholder="Todos" showClear className="w-full text-sm" {...DROPDOWN_PANEL_PROPS} />
            </div>
          </div>
          </div>
         </div>
        </div>
      </div>

      {/* ── Mobile ─────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{`Compras (${filteredData.length})`}</h1>
          <Button
            label="Nueva"
            icon="pi pi-plus"
            severity="success"
            size="small"
            raised
            onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.NEW_PURCHASE_ORDER}`)}
          />
        </div>

        {filteredData.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin compras.</p>
        )}

        {filteredData.slice(0, mobilePage * MOBILE_PAGE_SIZE).map((item: IPurchaseOrder) => {
          const status = getStatus(item.status);
          return (
            <div
              key={item._id}
              className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer transition-colors duration-150 active:bg-gray-50"
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
                {formatAmount(item.total)} {currency}
              </p>
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <RowActionButtons actions={buildPurchaseOrderActions(item)} size="small" />
              </div>
            </div>
          );
        })}
        {mobilePage * MOBILE_PAGE_SIZE < filteredData.length && (
          <Button
            label={`Cargar más (${filteredData.length - mobilePage * MOBILE_PAGE_SIZE} restantes)`}
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
          data={filteredData}
          emptyMessage="Sin compras."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
          onSelectionChange={handleSelectionChange}
        />
      </Card>
    </div>
  );
};

export default PurchaseOrderList;
