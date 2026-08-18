import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useAbility } from "../../casl/AbilityContext";
import { canDoAny } from "../../casl/ability";
import Table from "../../components/datatable/Table";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import RowActionButtons, { RowAction } from "../../components/table/RowActionButtons";
import TextLink from "../../components/TextLink/TextLink";
import { MARK_COMMISSION_PAID, REVERT_COMMISSION_PAYMENT } from "../../graphql/mutations/Commission";
import { LIST_COMMISSIONS } from "../../graphql/queries/Commission";
import { LIST_USER } from "../../graphql/queries/User";
import { DETAIL_COMPANY } from "../../graphql/queries/Company";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import { setIsBlocked } from "../../redux/slices/blockUISlice";
import { commissionStatus } from "../../utils/enums/commissionStatus.enum";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { ICommission } from "../../utils/interfaces/Commission";
import { DataTableColumn } from "../../utils/interfaces/Table";
import { formatAmount } from "../../utils/currency";
import { showToast } from "../../utils/toastUtils";
import useAuth from "../auth/hooks/useAuth";
import { getDate } from "../order/utils/getDate";
import { generateCommissionReportPDF } from "./utils/generateCommissionReportPDF";
import { generateCommissionPDF } from "./utils/generateCommissionPDF";

const DROPDOWN_PANEL_PROPS = {
  panelStyle: { maxWidth: "95vw" },
};

const STATUS_OPTIONS = [
  { label: "Pendiente", value: commissionStatus.PENDIENTE },
  { label: "Pagada", value: commissionStatus.PAGADA },
  { label: "Anulada", value: commissionStatus.ANULADA },
];

const statusSeverity: Record<string, "success" | "warning" | "danger"> = {
  [commissionStatus.PAGADA]: "success",
  [commissionStatus.PENDIENTE]: "warning",
  [commissionStatus.ANULADA]: "danger",
};

const statCardBase =
  "bg-white rounded-2xl border border-slate-100 border-t-4 shadow-sm p-4 flex flex-col gap-3";

const CommissionList = () => {
  const { currency, isGlobal } = useAuth();
  const ability = useAbility();
  const canPay = canDoAny(ability, ["PAY_COMMISSION"]);
  const client = useApolloClient();
  const dispatch = useDispatch();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sellerFilter, setSellerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Los filtros se mandan al backend como variables de la query — antes se
  // pedían TODAS las comisiones de la empresa (sin variables) y se filtraba
  // 100% del lado del cliente, dejando el filtro del backend sin usar y
  // trayendo el historial completo de comisiones en cada carga de página.
  const filterVariables = useMemo(
    () => ({
      filter: {
        sellerId: sellerFilter || undefined,
        status: statusFilter || undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      },
    }),
    [sellerFilter, statusFilter, startDate, endDate]
  );

  const { data, loading, refetch } = useQuery(LIST_COMMISSIONS, {
    variables: filterVariables,
    fetchPolicy: "network-only",
  });

  // Independiente del filtro activo: la lista de vendedores del dropdown sale
  // de los usuarios de la empresa, no de las comisiones ya traídas — si
  // saliera de ahí, elegir un vendedor dejaría solo a ese vendedor en la
  // lista de opciones (circular), y un vendedor sin comisiones aún nunca
  // aparecería.
  const { data: userData } = useQuery(LIST_USER, {
    skip: !isGlobal,
    fetchPolicy: "cache-first",
  });

  const [markCommissionPaid] = useMutation(MARK_COMMISSION_PAID);
  const [revertCommissionPayment] = useMutation(REVERT_COMMISSION_PAYMENT);

  const filteredData: ICommission[] = data?.listCommissions ?? [];

  const sellerOptions = useMemo(() => {
    const users = userData?.listUser ?? [];
    return users
      .filter((u: any) => u.is_active)
      .map((u: any) => ({ label: u.user_name, value: u._id }));
  }, [userData]);

  const hasActiveFilter = !!startDate || !!endDate || !!sellerFilter || !!statusFilter;

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSellerFilter("");
    setStatusFilter("");
  };

  const handleGeneratePDF = () => {
    const sellerLabel = sellerOptions.find((s: any) => s.value === sellerFilter)?.label;
    generateCommissionReportPDF(filteredData, currency, {
      sellerLabel,
      status: statusFilter || undefined,
      startDate,
      endDate,
    });
  };

  const handleOpenTicket = (commissionId: string) => {
    window.open(`${ROUTES_MOCK.COMMISSIONS}/${commissionId}/ticket`, "_blank");
  };

  const handleGenerateCommissionPDF = async (rowData: ICommission) => {
    try {
      dispatch(setIsBlocked(true));
      const { data: dataCompany } = await client.query({ query: DETAIL_COMPANY, fetchPolicy: "network-only" });
      await generateCommissionPDF(rowData, currency, dataCompany.detailCompany);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const buildCommissionActions = (rowData: ICommission): RowAction[] => {
    const actions: RowAction[] = [
      { label: "Imprimir ticket (térmica)", icon: "pi pi-print", severity: "secondary", onClick: () => handleOpenTicket(rowData._id) },
      { label: "Imprimir comisión", icon: "pi pi-download", severity: "secondary", onClick: () => handleGenerateCommissionPDF(rowData) },
    ];
    if (canPay && rowData.status === commissionStatus.PENDIENTE) {
      actions.push({ label: "Marcar como pagada", icon: "pi pi-check", severity: "success", onClick: () => handleMarkPaid(rowData._id) });
    }
    if (canPay && rowData.status === commissionStatus.PAGADA) {
      actions.push({ label: "Anular pago", icon: "pi pi-undo", severity: "danger", onClick: () => confirmRevertPayment(rowData._id) });
    }
    return actions;
  };

  const totalPending = filteredData
    .filter((c) => c.status === commissionStatus.PENDIENTE)
    .reduce((acc, c) => acc + c.amount, 0);
  const totalPaid = filteredData
    .filter((c) => c.status === commissionStatus.PAGADA)
    .reduce((acc, c) => acc + c.amount, 0);

  const handleMarkPaid = async (commissionId: string) => {
    try {
      await markCommissionPaid({ variables: { commissionId } });
      showToast({ detail: "Comisión marcada como pagada.", severity: ToastSeverity.Success });
      refetch();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const handleRevertPayment = async (commissionId: string) => {
    try {
      await revertCommissionPayment({ variables: { commissionId } });
      showToast({ detail: "Pago de la comisión anulado — volvió a Pendiente.", severity: ToastSeverity.Success });
      refetch();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  // Anular un pago ya hecho no es un click sin querer que se pueda deshacer
  // solo — vale la pena una confirmación antes.
  const confirmRevertPayment = (commissionId: string) => {
    confirmDialog({
      message: "¿Anular el pago de esta comisión? Vuelve a quedar Pendiente — esto no revierte ninguna transferencia real de dinero, solo el registro.",
      header: "Anular pago",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => handleRevertPayment(commissionId),
    });
  };

  const statusBodyTemplate = (rowData: ICommission) => (
    <Tag severity={statusSeverity[rowData.status] ?? "secondary"}>{rowData.status}</Tag>
  );

  const actionBodyTemplate = (rowData: ICommission) => (
    <RowActionButtons actions={buildCommissionActions(rowData)} />
  );

  const [columns] = useState<DataTableColumn<ICommission>[]>([
    {
      field: "createdAt",
      header: "Fecha",
      sortable: true,
      body: (rowData: ICommission) => <span className="text-gray-600">{getDate(rowData.createdAt)}</span>,
    },
    {
      field: "seller.user_name",
      header: "Vendedor",
      sortable: true,
    },
    {
      field: "sale_order.code",
      header: "Venta",
      sortable: true,
      body: (rowData: ICommission) =>
        rowData.sale_order ? (
          <TextLink to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${rowData.sale_order._id}`}>
            {rowData.sale_order.code}
          </TextLink>
        ) : (
          <Tag severity="secondary" className="text-xs">Venta eliminada</Tag>
        ),
    },
    {
      field: "sale_order.total",
      header: "Total venta",
      sortable: true,
      style: { textAlign: "right" },
      body: (rowData: ICommission) =>
        rowData.sale_order ? (
          <span className="text-gray-700">
            {formatAmount(rowData.sale_order.total)} {rowData.sale_order.currency ?? currency}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      field: "rate",
      header: "%",
      sortable: true,
      style: { textAlign: "center", width: "8%" },
      body: (rowData: ICommission) => <span>{rowData.rate}%</span>,
    },
    {
      field: "amount",
      header: "Comisión",
      sortable: true,
      style: { textAlign: "right" },
      body: (rowData: ICommission) => (
        <span className="font-semibold text-gray-800">
          {formatAmount(rowData.amount)} {currency}
        </span>
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Resumen ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${statCardBase} border-t-amber-400`}>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <i className="pi pi-clock text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {formatAmount(totalPending)}
              <span className="text-sm font-medium text-slate-400 ml-1">{currency}</span>
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Total pendiente</p>
          </div>
        </div>

        <div className={`${statCardBase} border-t-teal-400`}>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <i className="pi pi-check-circle text-teal-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {formatAmount(totalPaid)}
              <span className="text-sm font-medium text-slate-400 ml-1">{currency}</span>
            </p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Total pagado</p>
          </div>
        </div>
      </div>

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
              <div className={`grid grid-cols-2 ${isGlobal ? "md:grid-cols-4" : "md:grid-cols-3"} gap-3`}>
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
                {isGlobal && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Vendedor</label>
                    <Dropdown value={sellerFilter} options={sellerOptions} onChange={(e) => setSellerFilter(e.value)}
                      placeholder="Todos" showClear filter className="w-full text-sm" {...DROPDOWN_PANEL_PROPS} />
                  </div>
                )}
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

      {/* ── Cabecera mobile ────────────────────────────────────── */}
      <div className="flex justify-between items-center px-1 lg:hidden">
        <h1 className="text-xl font-bold text-gray-800">
          Comisiones <span className="text-base font-normal text-gray-400">({filteredData.length})</span>
        </h1>
        <Button
          icon="pi pi-download"
          severity="secondary"
          outlined
          size="small"
          onClick={handleGeneratePDF}
          disabled={filteredData.length === 0}
        />
      </div>

      {/* ── Vista mobile: cards ────────────────────────────────── */}
      <div className="flex flex-col gap-2 lg:hidden">
        {filteredData.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">Sin comisiones registradas.</p>
        )}
        {filteredData.map((c) => (
          <div key={c._id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-3">
            <div className="flex items-center justify-between">
              {c.sale_order ? (
                <TextLink to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${c.sale_order._id}`}>
                  <span className="font-bold text-gray-800 text-sm">{c.sale_order.code}</span>
                </TextLink>
              ) : (
                <Tag severity="secondary" className="text-xs">Venta eliminada</Tag>
              )}
              {statusBodyTemplate(c)}
            </div>
            <p className="text-sm text-gray-600 mt-1">{c.seller?.user_name}</p>
            <div className="flex items-center justify-between mt-1.5 text-sm">
              <span className="text-gray-500">{getDate(c.createdAt)}</span>
              {c.sale_order && (
                <span className="text-gray-500">{c.rate}% de {formatAmount(c.sale_order.total)} {c.sale_order.currency ?? currency}</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-1 text-sm">
              <span className="font-bold text-gray-800">
                Comisión: {formatAmount(c.amount)} {currency}
              </span>
            </div>
            <div className="flex justify-end mt-2 border-t border-gray-100 pt-2">
              <RowActionButtons actions={buildCommissionActions(c)} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Vista desktop: tabla ───────────────────────────────── */}
      <Card
        id="commission-list-table"
        className="hidden lg:block py-2"
        header={
          <div className="flex justify-between items-center m-2 px-5">
            <h1 className="text-2xl font-bold">{`Comisiones (${filteredData.length})`}</h1>
            <Button
              label="Imprimir"
              icon="pi pi-download"
              severity="secondary"
              outlined
              onClick={handleGeneratePDF}
              disabled={filteredData.length === 0}
            />
          </div>
        }
      >
        <Table
          columns={columns}
          data={filteredData}
          emptyMessage="Sin comisiones registradas."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
        />
      </Card>
    </div>
  );
};

export default CommissionList;
