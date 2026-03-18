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
import { DELETE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_SALE_ORDER_TO_PDF,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
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

const STATUS_OPTIONS = [
  { label: "Borrador", value: orderStatus.BORRADOR },
  { label: "Aprobado", value: orderStatus.APROBADO },
  { label: "Cancelado", value: orderStatus.CANCELADO },
];

const PAYMENT_METHOD_OPTIONS = [
  { label: "Contado", value: paymentMethod.CONTADO },
  { label: "Crédito", value: paymentMethod.CREDITO },
];

const IS_PAID_OPTIONS = [
  { label: "Pagada", value: "Pagada" },
  { label: "Pendiente", value: "Pendiente" },
];

const SaleOrderList = () => {
  const { listSaleOrder, loadingListSaleOrder } = useSaleOrderList();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();
  const client = useApolloClient();

  // ── Filter state ──────────────────────────────────────────────
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [isPaidFilter, setIsPaidFilter] = useState("");

  const hasActiveFilter =
    !!startDate || !!endDate || !!clientFilter || !!sellerFilter ||
    !!statusFilter || !!paymentMethodFilter || !!isPaidFilter;

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setClientFilter("");
    setSellerFilter("");
    setStatusFilter("");
    setPaymentMethodFilter("");
    setIsPaidFilter("");
  };

  // Unique clients for dropdown
  const clientOptions = useMemo(() => {
    const names = [...new Set(
      (listSaleOrder ?? []).map((o: ISaleOrder) => o.client?.fullName).filter(Boolean)
    )];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [listSaleOrder]);

  // Unique sellers for dropdown
  const sellerOptions = useMemo(() => {
    const names = [...new Set(
      (listSaleOrder ?? []).map((o: ISaleOrder) => o.created_by?.user_name).filter(Boolean)
    )];
    return names.map((n) => ({ label: n, value: n }));
  }, [listSaleOrder]);

  // Filtered data (client-side, all filters combined)
  const filteredData = useMemo(() => {
    if (!listSaleOrder) return [];
    return listSaleOrder.filter((order: ISaleOrder) => {
      const orderDate = new Date(Number(order.date));

      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        if (orderDate < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        if (orderDate > e) return false;
      }
      if (clientFilter && order.client?.fullName !== clientFilter) return false;
      if (sellerFilter && order.created_by?.user_name !== sellerFilter) return false;
      if (statusFilter && order.status !== statusFilter) return false;
      if (paymentMethodFilter && order.payment_method !== paymentMethodFilter) return false;
      if (isPaidFilter) {
        if (order.status !== orderStatus.APROBADO) return false;
        if (isPaidFilter === "Pagada" && !order.is_paid) return false;
        if (isPaidFilter === "Pendiente" && order.is_paid) return false;
      }
      return true;
    });
  }, [listSaleOrder, startDate, endDate, clientFilter, sellerFilter, statusFilter, paymentMethodFilter, isPaidFilter]);

  // ── Mutations ─────────────────────────────────────────────────
  const [DeleteSaleOrder] = useMutation(DELETE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  // ── Row templates ─────────────────────────────────────────────
  const statusBodyTemplate = (rowData: ISaleOrder) => {
    const status = getStatus(rowData.status);
    if (!status) return null;
    return (
      <Tag severity={status.severity as "secondary" | "success" | "info" | "warning" | "danger"}>
        {status.label}
      </Tag>
    );
  };

  const dateBodyTemplate = (rowData: ISaleOrder) =>
    rowData.date ? <Tag>{getDate(rowData.date)}</Tag> : null;

  const clientBodyTemplate = (rowData: ISaleOrder) =>
    rowData.client ? (
      <label>({rowData.client.code}) {rowData.client.fullName}</label>
    ) : null;

  // ── Delete / PDF ──────────────────────────────────────────────
  const handleDeleteSaleOrder = async (saleOrderId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await DeleteSaleOrder({ variables: { saleOrderId } });
      if (data.deleteSaleOrder.success) {
        showToast({ detail: "Orden de venta eliminada.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmDeleteSaleOrder = (saleOrderId: string) => {
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
      const { data } = await client.query({ query: FIND_SALE_ORDER_TO_PDF, variables: { saleOrderId }, fetchPolicy: "network-only" });
      const { data: dataCompany } = await client.query({ query: DETAIL_COMPANY, fetchPolicy: "network-only" });
      generatePDF(data.findSaleOrderToPDF, dataCompany.detailCompany, currency);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: ISaleOrder) => {
    if (rowData.status === orderStatus.BORRADOR) {
      return (
        <div className="flex justify-center gap-2">
          <Button tooltip="Completar venta" tooltipOptions={{ position: "left" }}
            icon="pi pi-pencil" raised severity="info"
            onClick={() => navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.EDIT_SALE_ORDER}/${rowData._id}`)} />
          {rowData.total > 0 && (
            <Button tooltip="Imprimir venta" tooltipOptions={{ position: "left" }}
              icon="pi pi-download" raised severity="warning"
              onClick={() => handleGeneratePDF(rowData._id)} />
          )}
          <Button tooltip="Eliminar venta" tooltipOptions={{ position: "left" }}
            icon="pi pi-trash" raised severity="danger"
            onClick={() => confirmDeleteSaleOrder(rowData._id)} />
        </div>
      );
    }
    return (
      <div className="flex justify-center gap-2">
        <Button tooltip="Imprimir venta" tooltipOptions={{ position: "left" }}
          icon="pi pi-download" raised severity="warning"
          onClick={() => handleGeneratePDF(rowData._id)} />
        {rowData.payment_method === paymentMethod.CREDITO && (
          <Button tooltip="Ver Pagos" tooltipOptions={{ position: "left" }}
            icon="pi pi-wallet" raised severity="info"
            onClick={() => navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.SALE_PAYMENT}/${rowData._id}`)} />
        )}
        <Button tooltip="Anular y eliminar venta" tooltipOptions={{ position: "left" }}
          icon="pi pi-trash" raised severity="danger"
          onClick={() => confirmDeleteSaleOrder(rowData._id)} />
      </div>
    );
  };

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<ISaleOrder[]>) => {
    navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<ISaleOrder>[]>([
    { field: "code", header: "Codigo", sortable: true },
    { field: "date", header: "Fecha", sortable: true, body: dateBodyTemplate },
    { field: "client.firstName", header: "Cliente", sortable: true, body: clientBodyTemplate },
    { field: "created_by.user_name", header: "Vendedor", sortable: true },
    { field: "payment_method", header: "Metodo de pago", sortable: true },
    {
      field: "total", header: "Total", sortable: true, style: { textAlign: "center" },
      body: (rowData: ISaleOrder) => (
        <LabelInput className="justify-center" label={`${rowData.total} ${currency}`} />
      ),
    },
    { field: "status", header: "Estado", sortable: true, body: statusBodyTemplate, style: { textAlign: "center" } },
    {
      field: "is_paid", header: "Estado de pago", sortable: true, style: { textAlign: "center" },
      body: (rowData: ISaleOrder) => {
        if (rowData.status !== orderStatus.APROBADO)
          return <span style={{ color: "#6B7280" }}>Borrador</span>;
        return rowData.is_paid
          ? <span style={{ color: "green" }}>Pagada</span>
          : <span style={{ color: "red" }}>Pendiente</span>;
      },
    },
  ]);

  if (loadingListSaleOrder) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Filter panel ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="pi pi-filter text-slate-500" />
            Filtros
            {hasActiveFilter && (
              <Tag severity="info" className="text-xs">{filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}</Tag>
            )}
          </span>
          {hasActiveFilter && (
            <Button
              label="Limpiar filtros"
              icon="pi pi-times"
              size="small"
              severity="secondary"
              outlined
              onClick={clearFilters}
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Fecha inicio */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Fecha inicio</label>
            <Calendar
              value={startDate}
              onChange={(e) => setStartDate(e.value as Date | null)}
              dateFormat="dd/mm/yy"
              placeholder="Desde"
              showIcon
              showButtonBar
              inputClassName="text-sm"
            />
          </div>

          {/* Fecha fin */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Fecha fin</label>
            <Calendar
              value={endDate}
              onChange={(e) => setEndDate(e.value as Date | null)}
              dateFormat="dd/mm/yy"
              placeholder="Hasta"
              showIcon
              showButtonBar
              inputClassName="text-sm"
            />
          </div>

          {/* Cliente */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Cliente</label>
            <Dropdown
              value={clientFilter}
              options={clientOptions}
              onChange={(e) => setClientFilter(e.value)}
              placeholder="Todos"
              showClear
              filter
              className="w-full text-sm"
            />
          </div>

          {/* Vendedor */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Vendedor</label>
            <Dropdown
              value={sellerFilter}
              options={sellerOptions}
              onChange={(e) => setSellerFilter(e.value)}
              placeholder="Todos"
              showClear
              className="w-full text-sm"
            />
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Estado</label>
            <Dropdown
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(e) => setStatusFilter(e.value)}
              placeholder="Todos"
              showClear
              className="w-full text-sm"
            />
          </div>

          {/* Método de pago */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Método de pago</label>
            <Dropdown
              value={paymentMethodFilter}
              options={PAYMENT_METHOD_OPTIONS}
              onChange={(e) => setPaymentMethodFilter(e.value)}
              placeholder="Todos"
              showClear
              className="w-full text-sm"
            />
          </div>

          {/* Estado de pago */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Estado de pago</label>
            <Dropdown
              value={isPaidFilter}
              options={IS_PAID_OPTIONS}
              onChange={(e) => setIsPaidFilter(e.value)}
              placeholder="Todos"
              showClear
              className="w-full text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <Card
        id="sale-list-table"
        className="py-2"
        header={
          <div className="flex justify-between items-center m-2 px-5">
            <h1 className="text-2xl font-bold">
              {`Lista de ventas (${filteredData.length})`}
            </h1>
            <Button
              id="btn-new-sale"
              icon="pi pi-plus"
              severity="success"
              tooltip="Nueva venta"
              tooltipOptions={{ position: "left" }}
              onClick={() => navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.NEW_SALE_ORDER}`)}
              raised
            />
          </div>
        }
      >
        <Table
          columns={columns}
          data={filteredData}
          emptyMessage="Sin ventas."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
          onSelectionChange={handleSelectionChange}
        />
      </Card>
    </div>
  );
};

export default SaleOrderList;
