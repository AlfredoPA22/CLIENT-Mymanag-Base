import { useQuery } from "@apollo/client";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import RowActionButtons, { RowAction } from "../../../../components/table/RowActionButtons";
import TextLink from "../../../../components/TextLink/TextLink";
import { LIST_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { LIST_SALE_PAYMENT } from "../../../../graphql/queries/SalePayment";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { paymentMethod } from "../../../../utils/enums/paymentMethod.enum";
import { ISaleOrder } from "../../../../utils/interfaces/SaleOrder";
import { ISalePayment } from "../../../../utils/interfaces/SalePayment";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { getDate } from "../../utils/getDate";
import useAuth from "../../../auth/hooks/useAuth";
import { formatAmount, round2 } from "../../../../utils/currency";

const DROPDOWN_PANEL_PROPS = {
  panelStyle: { maxWidth: "95vw" },
  panelClassName: "[&_.p-dropdown-item]:whitespace-normal [&_.p-dropdown-item]:leading-snug",
};

const STATUS_OPTIONS = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "Parcial", value: "Parcial" },
  { label: "Pagada", value: "Pagada" },
];

interface ReceivableRow {
  saleOrder: ISaleOrder;
  totalPaid: number;
  totalPending: number;
  statusLabel: "Pendiente" | "Parcial" | "Pagada";
}

const statusSeverity: Record<ReceivableRow["statusLabel"], "success" | "warning" | "danger"> = {
  Pagada: "success",
  Parcial: "warning",
  Pendiente: "danger",
};

const PaymentList = () => {
  const navigate = useNavigate();
  const { currency } = useAuth();

  const { data: saleOrderData, loading: loadingSaleOrder } = useQuery<{ listSaleOrder: ISaleOrder[] }>(
    LIST_SALE_ORDER,
    { fetchPolicy: "network-only" }
  );
  const { data: paymentData, loading: loadingPayments } = useQuery<{ listSalePayment: ISalePayment[] }>(
    LIST_SALE_PAYMENT,
    { fetchPolicy: "network-only" }
  );

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loading = loadingSaleOrder || loadingPayments;

  // Cuentas por cobrar = ventas al crédito ya aprobadas — a cada una se le
  // suma lo pagado (de listSalePayment) para saber cuánto falta.
  const receivables = useMemo<ReceivableRow[]>(() => {
    const saleOrders = saleOrderData?.listSaleOrder ?? [];
    const payments = paymentData?.listSalePayment ?? [];

    const paidBySaleOrder = new Map<string, number>();
    payments.forEach((p) => {
      if (!p.sale_order?._id) return;
      paidBySaleOrder.set(
        p.sale_order._id,
        (paidBySaleOrder.get(p.sale_order._id) ?? 0) + (p.amount ?? 0)
      );
    });

    return saleOrders
      .filter(
        (o) => o.payment_method === paymentMethod.CREDITO && o.status === orderStatus.APROBADO
      )
      .map((saleOrder) => {
        const totalPaid = round2(paidBySaleOrder.get(saleOrder._id) ?? 0);
        const totalPending = round2(Math.max(saleOrder.total - totalPaid, 0));
        const statusLabel: ReceivableRow["statusLabel"] = saleOrder.is_paid
          ? "Pagada"
          : totalPaid > 0
            ? "Parcial"
            : "Pendiente";
        return { saleOrder, totalPaid, totalPending, statusLabel };
      });
  }, [saleOrderData, paymentData]);

  const hasActiveFilter = !!startDate || !!endDate || !!clientFilter || !!statusFilter;

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setClientFilter("");
    setStatusFilter("");
  };

  const clientOptions = useMemo(() => {
    const names = [...new Set(receivables.map((r) => r.saleOrder.client?.fullName).filter(Boolean))];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [receivables]);

  const filteredData = useMemo(() => {
    return receivables.filter((r) => {
      const orderDate = new Date(Number(r.saleOrder.date));
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
      if (clientFilter && r.saleOrder.client?.fullName !== clientFilter) return false;
      if (statusFilter && r.statusLabel !== statusFilter) return false;
      return true;
    });
  }, [receivables, startDate, endDate, clientFilter, statusFilter]);

  const buildPaymentActions = (rowData: ReceivableRow): RowAction[] => [
    {
      label: "Ver pagos",
      icon: "pi pi-eye",
      severity: "info",
      onClick: () =>
        navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.SALE_PAYMENT}/${rowData.saleOrder._id}`),
    },
  ];

  const actionBodyTemplate = (rowData: ReceivableRow) => (
    <RowActionButtons actions={buildPaymentActions(rowData)} />
  );

  const statusBodyTemplate = (rowData: ReceivableRow) => (
    <Tag severity={statusSeverity[rowData.statusLabel]}>{rowData.statusLabel}</Tag>
  );

  const [columns] = useState<DataTableColumn<ReceivableRow>[]>([
    {
      field: "saleOrder.date",
      header: "Fecha",
      sortable: true,
      body: (rowData: ReceivableRow) =>
        rowData.saleOrder.date ? <Tag>{getDate(rowData.saleOrder.date)}</Tag> : null,
    },
    {
      field: "saleOrder.code",
      header: "Venta",
      sortable: true,
      body: (rowData: ReceivableRow) => (
        <TextLink to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${rowData.saleOrder._id}`}>
          {rowData.saleOrder.code}
        </TextLink>
      ),
    },
    {
      field: "saleOrder.client.fullName",
      header: "Cliente",
      sortable: true,
      body: (rowData: ReceivableRow) => rowData.saleOrder.client?.fullName ?? "-",
    },
    {
      field: "saleOrder.total",
      header: "Total",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: ReceivableRow) => (
        <LabelInput className="justify-center" label={`${formatAmount(rowData.saleOrder.total)} ${currency}`} />
      ),
    },
    {
      field: "totalPaid",
      header: "Pagado",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: ReceivableRow) => (
        <span className="text-green-600 font-medium">{formatAmount(rowData.totalPaid)} {currency}</span>
      ),
    },
    {
      field: "totalPending",
      header: "Debe",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: ReceivableRow) => (
        <span className={`font-medium ${rowData.totalPending > 0 ? "text-red-600" : "text-gray-400"}`}>
          {formatAmount(rowData.totalPending)} {currency}
        </span>
      ),
    },
    {
      field: "statusLabel",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { textAlign: "center" },
    },
  ]);

  if (loading) return <LoadingSpinner />;

  const totalPending = round2(filteredData.reduce((sum, r) => sum + r.totalPending, 0));

  return (
    <div className="flex flex-col gap-3">
      {/* ── Panel de filtros ───────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div
          className="flex items-center justify-between p-4 cursor-pointer md:cursor-default select-none"
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
            <i className={`pi pi-chevron-down md:hidden transition-transform duration-200 text-slate-400 ${filtersOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        <div className={`${filtersOpen ? "block" : "hidden"} md:block px-4 pb-4 border-t border-gray-100 pt-3`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
              <label className="text-xs font-medium text-slate-500">Cliente</label>
              <Dropdown value={clientFilter} options={clientOptions} onChange={(e) => setClientFilter(e.value)}
                placeholder="Todos" showClear filter className="w-full text-sm" {...DROPDOWN_PANEL_PROPS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Estado</label>
              <Dropdown value={statusFilter} options={STATUS_OPTIONS} onChange={(e) => setStatusFilter(e.value)}
                placeholder="Todos" showClear className="w-full text-sm" {...DROPDOWN_PANEL_PROPS} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Cabecera mobile ────────────────────────────────────── */}
      <div className="flex justify-between items-center px-1 md:hidden">
        <h1 className="text-xl font-bold text-gray-800">
          Pagos <span className="text-base font-normal text-gray-400">({filteredData.length})</span>
        </h1>
      </div>

      {/* ── Vista mobile: cards ────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:hidden">
        {filteredData.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">Sin ventas al crédito.</p>
        )}
        {filteredData.map((row) => (
          <div
            key={row.saleOrder._id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-3"
          >
            <div className="flex items-center justify-between">
              <TextLink to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${row.saleOrder._id}`}>
                <span className="font-bold text-gray-800 text-sm">{row.saleOrder.code}</span>
              </TextLink>
              {row.saleOrder.date && <Tag className="text-xs">{getDate(row.saleOrder.date)}</Tag>}
            </div>
            {row.saleOrder.client && (
              <p className="text-sm text-gray-600 mt-1">{row.saleOrder.client.fullName}</p>
            )}
            <div className="flex items-center justify-between mt-1.5 text-sm">
              <span className="text-gray-500">Total: {formatAmount(row.saleOrder.total)} {currency}</span>
              {statusBodyTemplate(row)}
            </div>
            <div className="flex items-center justify-between mt-1 text-sm">
              <span className="text-green-600 font-medium">Pagado: {formatAmount(row.totalPaid)} {currency}</span>
              <span className={`font-bold ${row.totalPending > 0 ? "text-red-600" : "text-gray-400"}`}>
                Debe: {formatAmount(row.totalPending)} {currency}
              </span>
            </div>
            <div className="flex justify-end mt-2 border-t border-gray-100 pt-2">
              <RowActionButtons actions={buildPaymentActions(row)} size="small" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Vista desktop: tabla ───────────────────────────────── */}
      <Card
        id="payment-list-table"
        className="hidden md:block py-2"
        header={
          <div className="flex justify-between items-center m-2 px-5">
            <h1 className="text-2xl font-bold">{`Pagos (${filteredData.length})`}</h1>
            <span className="text-sm font-semibold text-red-600">
              Total por cobrar: {formatAmount(totalPending)} {currency}
            </span>
          </div>
        }
      >
        <Table
          columns={columns}
          data={filteredData}
          emptyMessage="Sin ventas al crédito."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
        />
      </Card>
    </div>
  );
};

export default PaymentList;
