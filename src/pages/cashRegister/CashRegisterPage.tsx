import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../components/datatable/Table";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { PermissionGuard } from "../auth/pages/PermissionGuard";
import {
  ADD_CASH_MOVEMENT,
  CLOSE_CASH_REGISTER,
  OPEN_CASH_REGISTER,
} from "../../graphql/mutations/CashRegister";
import {
  FIND_CURRENT_CASH_REGISTER,
  LIST_CASH_REGISTER,
} from "../../graphql/queries/CashRegister";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";
import { formatAmount } from "../../utils/currency";
import { DataTableColumn } from "../../utils/interfaces/Table";
import useAuth from "../auth/hooks/useAuth";

interface ICashMovement {
  type: "INGRESO" | "RETIRO";
  amount: number;
  currency?: string | null;
  description: string;
  date: string;
  created_by?: { user_name: string };
}

interface ICashRegister {
  _id: string;
  status: string;
  opening_amount: number;
  opening_amount_bs?: number | null;
  opening_date: string;
  opened_by?: { user_name: string };
  closing_amount?: number;
  closing_amount_bs?: number | null;
  closing_date?: string;
  closed_by?: { user_name: string };
  notes?: string;
  // Opcional: registros de caja creados antes de que este campo existiera
  // (previo al rediseño de 2026-08-07) no lo tienen en absoluto en Mongo, y
  // .lean() no les aplica el default [] del schema — puede venir undefined.
  movements?: ICashMovement[] | null;
  cash_sales?: number;
  cash_sales_bs?: number;
  cash_payments?: number;
  cash_payments_bs?: number;
  expected_amount?: number;
  expected_amount_bs?: number;
}

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const n = Number(value);
  const date = !isNaN(n) ? new Date(n) : new Date(value);
  return date.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MOVEMENT_TYPE_OPTIONS = [
  { label: "Ingreso", value: "INGRESO" },
  { label: "Retiro", value: "RETIRO" },
];

// Diferencia entre lo esperado y lo contado al cerrar — positiva significa
// que sobró efectivo, negativa que faltó.
const DifferenceTag = ({ diff, curLabel }: { diff: number; curLabel: string }) => {
  const rounded = Math.round(diff * 100) / 100;
  if (rounded === 0) {
    return <Tag severity="success">Cuadra en {curLabel}</Tag>;
  }
  return (
    <Tag severity={rounded > 0 ? "info" : "danger"}>
      {rounded > 0 ? "Sobra" : "Falta"} {formatAmount(Math.abs(rounded))} {curLabel}
    </Tag>
  );
};

const CashRegisterPage = () => {
  const { currency } = useAuth();
  // Solo las empresas que operan en $ pueden además recibir efectivo en su
  // moneda alterna (Bs) — ver saleOrder.service.ts#create. Para el resto,
  // la caja funciona en una sola moneda, igual que antes.
  const supportsBs = currency === "$";

  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showMovementsDialog, setShowMovementsDialog] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<ICashRegister | null>(null);
  const [openingAmount, setOpeningAmount] = useState<number | null>(null);
  const [openingAmountBs, setOpeningAmountBs] = useState<number | null>(null);
  const [openingNotes, setOpeningNotes] = useState("");
  const [closingAmount, setClosingAmount] = useState<number | null>(null);
  const [closingAmountBs, setClosingAmountBs] = useState<number | null>(null);
  const [closingNotes, setClosingNotes] = useState("");
  const [movementType, setMovementType] = useState<"INGRESO" | "RETIRO">("INGRESO");
  const [movementAmount, setMovementAmount] = useState<number | null>(null);
  const [movementCurrency, setMovementCurrency] = useState<string>(currency);
  const [movementDescription, setMovementDescription] = useState("");

  const {
    data: currentData,
    loading: loadingCurrent,
    refetch: refetchCurrent,
  } = useQuery(FIND_CURRENT_CASH_REGISTER, { fetchPolicy: "network-only" });

  const { data: listData, loading: loadingList, refetch: refetchList } =
    useQuery(LIST_CASH_REGISTER, { fetchPolicy: "network-only" });

  const [openCashRegister] = useMutation(OPEN_CASH_REGISTER);
  const [closeCashRegister] = useMutation(CLOSE_CASH_REGISTER);
  const [addCashMovement] = useMutation(ADD_CASH_MOVEMENT);

  const current: ICashRegister | null = currentData?.findCurrentCashRegister ?? null;
  const history: ICashRegister[] = listData?.listCashRegister ?? [];

  const refetchAll = () => {
    refetchCurrent();
    refetchList();
  };

  const handleOpenCashRegister = async () => {
    if (openingAmount === null || openingAmount < 0) {
      showToast({ detail: "Ingresa un monto de apertura válido", severity: ToastSeverity.Warn });
      return;
    }
    try {
      await openCashRegister({
        variables: {
          opening_amount: openingAmount,
          opening_amount_bs: supportsBs ? openingAmountBs ?? undefined : undefined,
          notes: openingNotes || undefined,
        },
      });
      showToast({ detail: "Caja abierta exitosamente", severity: ToastSeverity.Success });
      setShowOpenDialog(false);
      setOpeningAmount(null);
      setOpeningAmountBs(null);
      setOpeningNotes("");
      refetchAll();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const handleOpenCloseDialog = () => {
    setClosingAmount(null);
    setClosingAmountBs(null);
    setClosingNotes("");
    setShowCloseDialog(true);
  };

  const handleCloseCashRegister = async () => {
    if (!current?._id) return;
    if (closingAmount === null || closingAmount < 0) {
      showToast({ detail: "Ingresa un monto de cierre válido", severity: ToastSeverity.Warn });
      return;
    }
    try {
      await closeCashRegister({
        variables: {
          cashRegisterId: current._id,
          closing_amount: closingAmount,
          closing_amount_bs: supportsBs ? closingAmountBs ?? undefined : undefined,
          notes: closingNotes || undefined,
        },
      });
      showToast({ detail: "Caja cerrada exitosamente", severity: ToastSeverity.Success });
      setShowCloseDialog(false);
      refetchAll();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const handleOpenMovementsDialog = () => {
    setMovementType("INGRESO");
    setMovementAmount(null);
    setMovementCurrency(currency);
    setMovementDescription("");
    setShowMovementsDialog(true);
  };

  const handleAddMovement = async () => {
    if (!current?._id) return;
    if (movementAmount === null || movementAmount <= 0) {
      showToast({ detail: "Ingresa un monto válido", severity: ToastSeverity.Warn });
      return;
    }
    if (!movementDescription.trim()) {
      showToast({ detail: "Describe el motivo del movimiento", severity: ToastSeverity.Warn });
      return;
    }
    try {
      await addCashMovement({
        variables: {
          cashRegisterId: current._id,
          type: movementType,
          amount: movementAmount,
          currency: movementCurrency === "Bs" ? "Bs" : undefined,
          description: movementDescription.trim(),
        },
      });
      showToast({ detail: "Movimiento registrado", severity: ToastSeverity.Success });
      setMovementAmount(null);
      setMovementDescription("");
      refetchAll();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const handleSelectHistoryRow = (e: DataTableSelectionSingleChangeEvent<ICashRegister[]>) => {
    setSelectedRegister(e.value);
  };

  const columns: DataTableColumn<ICashRegister>[] = [
    {
      field: "status",
      header: "Estado",
      sortable: true,
      style: { textAlign: "center" },
      body: (row) => (
        <Tag severity={row.status === "ABIERTA" ? "success" : "secondary"}>
          {row.status === "ABIERTA" ? "Abierta" : "Cerrada"}
        </Tag>
      ),
    },
    {
      field: "opening_date",
      header: "Apertura",
      sortable: true,
      body: (row) => (
        <div className="flex flex-col">
          <span>{formatDateTime(row.opening_date)}</span>
          <span className="text-xs text-gray-400">{row.opened_by?.user_name}</span>
        </div>
      ),
    },
    {
      field: "opening_amount",
      header: "Apertura",
      sortable: true,
      style: { textAlign: "right" },
      body: (row) => (
        <div className="flex flex-col">
          <span>{formatAmount(row.opening_amount)} {currency}</span>
          {supportsBs && !!row.opening_amount_bs && (
            <span className="text-xs text-gray-400">{formatAmount(row.opening_amount_bs)} Bs</span>
          )}
        </div>
      ),
    },
    {
      field: "expected_amount",
      header: "Esperado",
      style: { textAlign: "right" },
      body: (row) => (
        <div className="flex flex-col">
          <span>{formatAmount(row.expected_amount ?? 0)} {currency}</span>
          {supportsBs && !!row.expected_amount_bs && (
            <span className="text-xs text-gray-400">{formatAmount(row.expected_amount_bs)} Bs</span>
          )}
        </div>
      ),
    },
    {
      field: "closing_amount",
      header: "Cierre",
      style: { textAlign: "right" },
      body: (row) =>
        row.closing_amount !== undefined && row.closing_amount !== null ? (
          <div className="flex flex-col">
            <span>{formatAmount(row.closing_amount)} {currency}</span>
            {supportsBs && !!row.closing_amount_bs && (
              <span className="text-xs text-gray-400">{formatAmount(row.closing_amount_bs)} Bs</span>
            )}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      field: "closing_date",
      header: "Diferencia",
      style: { textAlign: "center" },
      body: (row) => {
        if (row.closing_amount === undefined || row.closing_amount === null) {
          return <span className="text-gray-300">—</span>;
        }
        const diff = row.closing_amount - (row.expected_amount ?? 0);
        const diffBs = (row.closing_amount_bs ?? 0) - (row.expected_amount_bs ?? 0);
        return (
          <div className="flex flex-col items-center gap-1">
            <DifferenceTag diff={diff} curLabel={currency} />
            {supportsBs && !!row.expected_amount_bs && (
              <DifferenceTag diff={diffBs} curLabel="Bs" />
            )}
          </div>
        );
      },
    },
    {
      field: "notes",
      header: "Notas",
      body: (row) => row.notes || <span className="text-gray-300">—</span>,
    },
  ];

  if (loadingCurrent) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        {current ? (
          <div className="flex flex-col gap-4 p-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center md:items-start gap-1">
                <Tag severity="success">Caja abierta</Tag>
                <span className="text-sm text-gray-500">
                  Apertura: {formatDateTime(current.opening_date)} · {current.opened_by?.user_name}
                </span>
                {current.notes && <span className="text-xs text-gray-400">{current.notes}</span>}
              </div>
              <div className="flex gap-2">
                <PermissionGuard permissions={["CLOSE_CASH_REGISTER"]}>
                  <Button
                    icon="pi pi-plus"
                    label="Movimiento"
                    severity="secondary"
                    outlined
                    onClick={handleOpenMovementsDialog}
                  />
                  <Button
                    icon="pi pi-lock"
                    label="Cerrar caja"
                    severity="danger"
                    onClick={handleOpenCloseDialog}
                  />
                </PermissionGuard>
              </div>
            </div>

            {/* ── Resumen del turno ──────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Apertura</span>
                <span className="font-bold text-gray-700">{formatAmount(current.opening_amount)} {currency}</span>
                {supportsBs && !!current.opening_amount_bs && (
                  <span className="text-xs text-gray-500">{formatAmount(current.opening_amount_bs)} Bs</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Ventas en efectivo</span>
                <span className="font-bold text-gray-700">{formatAmount(current.cash_sales ?? 0)} {currency}</span>
                {supportsBs && !!current.cash_sales_bs && (
                  <span className="text-xs text-gray-500">{formatAmount(current.cash_sales_bs)} Bs</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Cobros en efectivo</span>
                <span className="font-bold text-gray-700">{formatAmount(current.cash_payments ?? 0)} {currency}</span>
                {supportsBs && !!current.cash_payments_bs && (
                  <span className="text-xs text-gray-500">{formatAmount(current.cash_payments_bs)} Bs</span>
                )}
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-emerald-600 uppercase font-semibold">Esperado en caja</span>
                <span className="font-bold text-emerald-700">{formatAmount(current.expected_amount ?? 0)} {currency}</span>
                {supportsBs && !!current.expected_amount_bs && (
                  <span className="text-xs text-emerald-600">{formatAmount(current.expected_amount_bs)} Bs</span>
                )}
              </div>
            </div>

            {(current.movements ?? []).length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 uppercase font-semibold">
                  Movimientos ({(current.movements ?? []).length})
                </span>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {(current.movements ?? []).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-gray-100 pb-1">
                      <span className="flex items-center gap-2">
                        <Tag severity={m.type === "INGRESO" ? "success" : "warning"} className="text-xs">
                          {m.type === "INGRESO" ? "Ingreso" : "Retiro"}
                        </Tag>
                        <span className="text-gray-600">{m.description}</span>
                      </span>
                      <span className={`font-medium ${m.type === "INGRESO" ? "text-emerald-600" : "text-orange-600"}`}>
                        {m.type === "INGRESO" ? "+" : "-"}{formatAmount(m.amount)} {m.currency ?? currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-4">
            <span className="text-gray-500">No hay una caja abierta actualmente.</span>
            <PermissionGuard permissions={["OPEN_CASH_REGISTER"]}>
              <Button
                icon="pi pi-lock-open"
                label="Abrir caja"
                severity="success"
                onClick={() => setShowOpenDialog(true)}
              />
            </PermissionGuard>
          </div>
        )}
      </Card>

      <Card
        header={<h1 className="text-xl font-bold p-4 pb-0">Historial de caja</h1>}
      >
        {loadingList ? (
          <LoadingSpinner />
        ) : (
          <Table
            columns={columns}
            data={history}
            emptyMessage="Sin registros de caja."
            size="small"
            onSelectionChange={handleSelectHistoryRow}
          />
        )}
      </Card>

      {/* ── Dialog apertura ─────────────────────────────────────── */}
      <Dialog
        header="Abrir caja"
        visible={showOpenDialog}
        onHide={() => setShowOpenDialog(false)}
        style={{ width: "420px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancelar" severity="secondary" outlined onClick={() => setShowOpenDialog(false)} />
            <Button label="Abrir caja" icon="pi pi-check" onClick={handleOpenCashRegister} />
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Monto de apertura ({currency}) <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={openingAmount}
              onValueChange={(e) => setOpeningAmount(e.value ?? null)}
              mode="decimal"
              minFractionDigits={2}
              min={0}
            />
          </div>
          {supportsBs && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Monto de apertura en Bs (opcional)
              </label>
              <InputNumber
                value={openingAmountBs}
                onValueChange={(e) => setOpeningAmountBs(e.value ?? null)}
                mode="decimal"
                minFractionDigits={2}
                min={0}
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notas (opcional)</label>
            <InputTextarea
              value={openingNotes}
              onChange={(e) => setOpeningNotes(e.target.value)}
              rows={2}
              autoResize
            />
          </div>
        </div>
      </Dialog>

      {/* ── Dialog cierre ───────────────────────────────────────── */}
      <Dialog
        header="Cerrar caja"
        visible={showCloseDialog}
        onHide={() => setShowCloseDialog(false)}
        style={{ width: "460px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancelar" severity="secondary" outlined onClick={() => setShowCloseDialog(false)} />
            <Button label="Cerrar caja" icon="pi pi-check" severity="danger" onClick={handleCloseCashRegister} />
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          <div className="bg-emerald-50 rounded-lg p-3 flex flex-col gap-0.5">
            <span className="text-xs text-emerald-600 uppercase font-semibold">Esperado en caja</span>
            <span className="font-bold text-emerald-700">{formatAmount(current?.expected_amount ?? 0)} {currency}</span>
            {supportsBs && !!current?.expected_amount_bs && (
              <span className="text-sm text-emerald-600">{formatAmount(current.expected_amount_bs)} Bs</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Monto contado al cierre ({currency}) <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={closingAmount}
              onValueChange={(e) => setClosingAmount(e.value ?? null)}
              mode="decimal"
              minFractionDigits={2}
              min={0}
            />
            {closingAmount !== null && (
              <DifferenceTag diff={closingAmount - (current?.expected_amount ?? 0)} curLabel={currency} />
            )}
          </div>

          {supportsBs && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Monto contado al cierre en Bs (opcional)
              </label>
              <InputNumber
                value={closingAmountBs}
                onValueChange={(e) => setClosingAmountBs(e.value ?? null)}
                mode="decimal"
                minFractionDigits={2}
                min={0}
              />
              {closingAmountBs !== null && (
                <DifferenceTag diff={closingAmountBs - (current?.expected_amount_bs ?? 0)} curLabel="Bs" />
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notas (opcional)</label>
            <InputTextarea
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              rows={2}
              autoResize
            />
          </div>
        </div>
      </Dialog>

      {/* ── Dialog movimiento ───────────────────────────────────── */}
      <Dialog
        header="Registrar movimiento de efectivo"
        visible={showMovementsDialog}
        onHide={() => setShowMovementsDialog(false)}
        style={{ width: "420px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cerrar" severity="secondary" outlined onClick={() => setShowMovementsDialog(false)} />
            <Button label="Agregar" icon="pi pi-check" onClick={handleAddMovement} />
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <SelectButton
              value={movementType}
              onChange={(e) => e.value && setMovementType(e.value)}
              options={MOVEMENT_TYPE_OPTIONS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Monto {supportsBs ? "" : `(${currency})`} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <InputNumber
                value={movementAmount}
                onValueChange={(e) => setMovementAmount(e.value ?? null)}
                mode="decimal"
                minFractionDigits={2}
                min={0}
                className="flex-1"
              />
              {supportsBs && (
                <SelectButton
                  value={movementCurrency}
                  onChange={(e) => e.value && setMovementCurrency(e.value)}
                  options={[{ label: currency, value: currency }, { label: "Bs", value: "Bs" }]}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Motivo <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              value={movementDescription}
              onChange={(e) => setMovementDescription(e.target.value)}
              rows={2}
              autoResize
              placeholder="Ej: depósito al banco, cambio para el vendedor..."
            />
          </div>
        </div>
      </Dialog>

      {/* ── Dialog detalle de caja (historial) ──────────────────── */}
      <Dialog
        header="Detalle de caja"
        visible={!!selectedRegister}
        onHide={() => setSelectedRegister(null)}
        style={{ width: "560px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end pt-2">
            <Button label="Cerrar" severity="secondary" outlined onClick={() => setSelectedRegister(null)} />
          </div>
        }
      >
        {selectedRegister && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex flex-col gap-1">
                <Tag severity={selectedRegister.status === "ABIERTA" ? "success" : "secondary"} className="w-fit">
                  {selectedRegister.status === "ABIERTA" ? "Abierta" : "Cerrada"}
                </Tag>
                <span className="text-sm text-gray-500">
                  Apertura: {formatDateTime(selectedRegister.opening_date)} · {selectedRegister.opened_by?.user_name}
                </span>
                {selectedRegister.closing_date && (
                  <span className="text-sm text-gray-500">
                    Cierre: {formatDateTime(selectedRegister.closing_date)} · {selectedRegister.closed_by?.user_name}
                  </span>
                )}
                {selectedRegister.notes && <span className="text-xs text-gray-400">{selectedRegister.notes}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Apertura</span>
                <span className="font-bold text-gray-700">{formatAmount(selectedRegister.opening_amount)} {currency}</span>
                {supportsBs && !!selectedRegister.opening_amount_bs && (
                  <span className="text-xs text-gray-500">{formatAmount(selectedRegister.opening_amount_bs)} Bs</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Ventas en efectivo</span>
                <span className="font-bold text-gray-700">{formatAmount(selectedRegister.cash_sales ?? 0)} {currency}</span>
                {supportsBs && !!selectedRegister.cash_sales_bs && (
                  <span className="text-xs text-gray-500">{formatAmount(selectedRegister.cash_sales_bs)} Bs</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 uppercase font-semibold">Cobros en efectivo</span>
                <span className="font-bold text-gray-700">{formatAmount(selectedRegister.cash_payments ?? 0)} {currency}</span>
                {supportsBs && !!selectedRegister.cash_payments_bs && (
                  <span className="text-xs text-gray-500">{formatAmount(selectedRegister.cash_payments_bs)} Bs</span>
                )}
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 flex flex-col gap-0.5">
                <span className="text-xs text-emerald-600 uppercase font-semibold">Esperado</span>
                <span className="font-bold text-emerald-700">{formatAmount(selectedRegister.expected_amount ?? 0)} {currency}</span>
                {supportsBs && !!selectedRegister.expected_amount_bs && (
                  <span className="text-xs text-emerald-600">{formatAmount(selectedRegister.expected_amount_bs)} Bs</span>
                )}
              </div>
              {selectedRegister.closing_amount !== undefined && selectedRegister.closing_amount !== null && (
                <>
                  <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400 uppercase font-semibold">Contado al cierre</span>
                    <span className="font-bold text-gray-700">{formatAmount(selectedRegister.closing_amount)} {currency}</span>
                    {supportsBs && !!selectedRegister.closing_amount_bs && (
                      <span className="text-xs text-gray-500">{formatAmount(selectedRegister.closing_amount_bs)} Bs</span>
                    )}
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 flex flex-col gap-1 justify-center">
                    <span className="text-xs text-blue-600 uppercase font-semibold">Diferencia</span>
                    <DifferenceTag
                      diff={selectedRegister.closing_amount - (selectedRegister.expected_amount ?? 0)}
                      curLabel={currency}
                    />
                    {supportsBs && !!selectedRegister.expected_amount_bs && (
                      <DifferenceTag
                        diff={(selectedRegister.closing_amount_bs ?? 0) - (selectedRegister.expected_amount_bs ?? 0)}
                        curLabel="Bs"
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase font-semibold">
                Movimientos ({(selectedRegister.movements ?? []).length})
              </span>
              {(selectedRegister.movements ?? []).length === 0 ? (
                <span className="text-sm text-gray-400">Sin movimientos manuales en este turno.</span>
              ) : (
                <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
                  {(selectedRegister.movements ?? []).map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-gray-100 pb-1">
                      <span className="flex items-center gap-2">
                        <Tag severity={m.type === "INGRESO" ? "success" : "warning"} className="text-xs">
                          {m.type === "INGRESO" ? "Ingreso" : "Retiro"}
                        </Tag>
                        <span className="text-gray-600">{m.description}</span>
                        <span className="text-xs text-gray-400">{formatDateTime(m.date)} · {m.created_by?.user_name}</span>
                      </span>
                      <span className={`font-medium whitespace-nowrap ${m.type === "INGRESO" ? "text-emerald-600" : "text-orange-600"}`}>
                        {m.type === "INGRESO" ? "+" : "-"}{formatAmount(m.amount)} {m.currency ?? currency}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default CashRegisterPage;
