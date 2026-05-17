import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { SelectButton } from "primereact/selectbutton";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { OrderSkeleton } from "../../../../components/skeleton/OrderSkeleton";
import { APPROVE_SALE_ORDER, UPDATE_SALE_ORDER_DISCOUNT } from "../../../../graphql/mutations/SaleOrder";
import { CREATE_SALE_RETURN } from "../../../../graphql/mutations/SaleReturn";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import { FIND_SALE_ORDER, LIST_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { LIST_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import { FIND_SALE_RETURN_BY_SALE_ORDER, LIST_SALE_RETURN, LIST_SALE_RETURN_DETAIL } from "../../../../graphql/queries/SaleReturn";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import SectionHeader from "../../../../components/sectionHeader/SectionHeader";
import useAuth from "../../../auth/hooks/useAuth";
import { PermissionGuard } from "../../../auth/pages/PermissionGuard";

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Ninguno", value: "NONE" },
  { label: "Fijo", value: "FIJO" },
  { label: "Porcentual", value: "PORCENTUAL" },
];

interface SaleOrderDetailProps {
  saleOrderId: string;
}

interface ReturnItem {
  saleOrderDetailId: string;
  quantity: number;
}

const SaleOrderDetail: FC<SaleOrderDetailProps> = ({ saleOrderId }) => {
  const { data, loading: loadingSaleOrder, error: errorSaleOrder, refetch: refetchSaleOrder } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "cache-and-network",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showReturnDetailDialog, setShowReturnDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

  const [orderDiscountType, setOrderDiscountType] = useState<string>("NONE");
  const [orderDiscountValue, setOrderDiscountValue] = useState<number | null>(null);

  const { data: returnData, refetch: refetchReturn } = useQuery(FIND_SALE_RETURN_BY_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "network-only",
    skip: data?.findSaleOrder?.status !== orderStatus.APROBADO && data?.findSaleOrder?.status !== orderStatus.DEVUELTO,
  });

  const existingReturn = returnData?.findSaleReturnBySaleOrder ?? null;

  const [loadDetails, { data: detailsData, loading: loadingDetails }] = useLazyQuery(
    LIST_SALE_ORDER_DETAIL,
    { fetchPolicy: "network-only" }
  );

  const [loadReturnDetail, { data: returnDetailData, loading: loadingReturnDetail }] = useLazyQuery(
    LIST_SALE_RETURN_DETAIL,
    { fetchPolicy: "network-only" }
  );

  const returnDetails: any[] = returnDetailData?.listSaleReturnDetail ?? [];

  const handleOpenReturnDetail = () => {
    if (existingReturn) {
      loadReturnDetail({ variables: { saleReturnId: existingReturn._id } });
      setShowReturnDetailDialog(true);
    }
  };

  const details: any[] = detailsData?.listSaleOrderDetail ?? [];

  const handleOpenDialog = () => {
    setReturnReason("");
    setReturnQuantities({});
    setShowReturnDialog(true);
    loadDetails({ variables: { saleOrderId } });
  };

  const handleCloseDialog = () => {
    setShowReturnDialog(false);
    setReturnReason("");
    setReturnQuantities({});
  };

  const [updateSaleOrderDiscount] = useMutation(UPDATE_SALE_ORDER_DISCOUNT, {
    refetchQueries: [{ query: FIND_SALE_ORDER, variables: { saleOrderId } }],
  });

  const handleOpenApproveDialog = () => {
    setOrderDiscountType("NONE");
    setOrderDiscountValue(null);
    setShowApproveDialog(true);
  };

  const handleClearOrderDiscount = async () => {
    try {
      dispatch(setIsBlocked(true));
      await updateSaleOrderDiscount({
        variables: { saleOrderId, discount_type: null, discount_value: null },
      });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleConfirmApprove = async () => {
    try {
      dispatch(setIsBlocked(true));
      // Siempre sincroniza el descuento a DB antes de aprobar (incluye limpiarlo si es NONE)
      await updateSaleOrderDiscount({
        variables: {
          saleOrderId,
          discount_type: orderDiscountType === "NONE" ? null : orderDiscountType,
          discount_value: orderDiscountType === "NONE" ? null : (orderDiscountValue ?? null),
        },
      });
      const { data: result } = await approveSaleOrder({ variables: { saleOrderId } });
      if (result) {
        showToast({ detail: "Venta Aprobada exitosamente", severity: ToastSeverity.Success });
        setShowApproveDialog(false);
        navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${result.approveSaleOrder._id}`);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const [approveSaleOrder] = useMutation(APPROVE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  const [createSaleReturn] = useMutation(CREATE_SALE_RETURN, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }, { query: LIST_SALE_RETURN }],
  });

  const handleCreateReturn = async () => {
    if (!existingReturn && !returnReason.trim()) {
      showToast({ detail: "Ingresa el motivo de la devolución", severity: ToastSeverity.Warn });
      return;
    }

    const items: ReturnItem[] = Object.entries(returnQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([saleOrderDetailId, quantity]) => ({ saleOrderDetailId, quantity }));

    if (items.length === 0) {
      showToast({ detail: "Selecciona al menos un producto con cantidad mayor a 0", severity: ToastSeverity.Warn });
      return;
    }

    try {
      dispatch(setIsBlocked(true));
      const { data: result } = await createSaleReturn({
        variables: { saleOrderId, reason: returnReason.trim() || existingReturn?.reason || "", items },
      });
      if (result) {
        const isAppend = !!existingReturn;
        showToast({
          detail: isAppend
            ? `Productos agregados a la devolución ${result.createSaleReturn.code}`
            : `Devolución ${result.createSaleReturn.code} registrada exitosamente`,
          severity: ToastSeverity.Success,
        });
        handleCloseDialog();
        refetchReturn();
        refetchSaleOrder();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };


  useEffect(() => {
    if (errorSaleOrder) {
      showToast({ detail: errorSaleOrder.message, severity: ToastSeverity.Error });
    }
  }, [errorSaleOrder]);

  const hasSelectedItems = Object.values(returnQuantities).some((qty) => qty > 0);

  const handleSelectAll = () => {
    const all: Record<string, number> = {};
    details.forEach((d: any) => { all[d._id] = d.quantity; });
    setReturnQuantities(all);
  };
  // Subtotal de productos = total actual + descuento general ya aplicado (viene de DB)
  const sumSubtotals = parseFloat(((data?.findSaleOrder.total ?? 0) + (data?.findSaleOrder.discount_amount ?? 0)).toFixed(2));
  const previewDiscount = (() => {
    if (orderDiscountType === "NONE" || !orderDiscountValue) return 0;
    if (orderDiscountType === "PORCENTUAL")
      return parseFloat((sumSubtotals * (orderDiscountValue / 100)).toFixed(2));
    return parseFloat(Math.min(orderDiscountValue, sumSubtotals).toFixed(2));
  })();
  const previewTotal = parseFloat((sumSubtotals - previewDiscount).toFixed(2));

  const date = getDate(data?.findSaleOrder.date) || "";

  if (loadingSaleOrder) return <OrderSkeleton />;

  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      <SectionHeader
        title="Detalle de venta"
        subtitle="Consulta la información de tu venta y realiza cambios si es necesario."
        actions={
          <Button
            label="Volver a la lista"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={() => navigate(ROUTES_MOCK.SALE_ORDERS)}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">

        {/* Código / estado / acciones — order-1 en mobile para que aparezca primero */}
        <section className="flex flex-col gap-4 rounded-md order-1 md:order-3">
          <div className="flex items-center justify-between md:flex-col md:items-center gap-2 bg-gray-100 px-4 py-3 md:p-4 rounded-xl">
            <div className="flex flex-col md:items-center gap-0.5">
              <span className="text-gray-500 text-xs">Código de Orden</span>
              <span className="text-lg md:text-xl font-bold text-gray-800">
                {data?.findSaleOrder.code}
              </span>
            </div>
            <Tag
              severity={getStatus(data?.findSaleOrder.status)?.severity as "danger" | "success" | "info" | "warning"}
            >
              {getStatus(data?.findSaleOrder.status)?.label}
            </Tag>
          </div>

          {data?.findSaleOrder.status === orderStatus.BORRADOR && (
            <PermissionGuard permissions={["CREATE_SALE", "EDIT_SALE"]}>
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar venta"
                className="w-full justify-center"
                onClick={handleOpenApproveDialog}
              />
            </PermissionGuard>
          )}

          {data?.findSaleOrder.status === orderStatus.APROBADO && (
            <div className="flex flex-col gap-2">
              <PermissionGuard permissions={["DETAIL_SALE"]}>
                {existingReturn && (
                  <Button
                    icon="pi pi-replay"
                    type="button"
                    severity="warning"
                    label={`Devolución: ${existingReturn.code}`}
                    onClick={handleOpenReturnDetail}
                    outlined
                    className="w-full"
                  />
                )}
              </PermissionGuard>
              <PermissionGuard permissions={["CREATE_SALE", "EDIT_SALE"]}>
                <Button
                  icon="pi pi-plus-circle"
                  type="button"
                  severity="warning"
                  label={existingReturn ? "Agregar más items" : "Registrar devolución"}
                  onClick={handleOpenDialog}
                  outlined={!!existingReturn}
                  className="w-full"
                />
              </PermissionGuard>
            </div>
          )}

          {data?.findSaleOrder.status === orderStatus.DEVUELTO && existingReturn && (
            <PermissionGuard permissions={["DETAIL_SALE"]}>
              <Button
                icon="pi pi-replay"
                type="button"
                severity="warning"
                label={`Devolución: ${existingReturn.code}`}
                onClick={handleOpenReturnDetail}
                outlined
                className="w-full"
              />
            </PermissionGuard>
          )}
        </section>

        {/* Info de la orden — order-2 en mobile */}
        <section className="flex flex-col gap-3 order-2 md:order-1 md:border-r md:border-gray-300 md:pr-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Fecha de venta</span>
              <span className="text-base font-medium text-gray-700">{date}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Condición de pago</span>
              <span className="text-base font-medium text-gray-700">
                {data?.findSaleOrder.payment_method}
              </span>
              {data?.findSaleOrder.payment_method === "Contado" && (
                <span className="text-xs text-gray-500 mt-0.5">
                  {data?.findSaleOrder.contado_payment_method ?? "No especificado"}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Cliente</span>
            <span className="text-base font-medium text-gray-700">
              {data?.findSaleOrder.client.fullName}
            </span>
          </div>
        </section>

        {/* Totales — order-3 en mobile (al final) */}
        <section className="flex flex-col items-center justify-center gap-1 text-center order-3 md:order-2 bg-green-50 md:bg-transparent rounded-xl md:rounded-none py-3 md:py-0">
          {(data?.findSaleOrder.discount_amount ?? 0) > 0 && (
            <>
              <span className="text-xs text-gray-400">Subtotal productos</span>
              <span className="text-sm text-gray-600">
                {`${((data?.findSaleOrder.total ?? 0) + (data?.findSaleOrder.discount_amount ?? 0)).toFixed(2)} ${currency}`}
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs text-orange-500">
                  Descuento general: -{(data?.findSaleOrder.discount_amount ?? 0).toFixed(2)} {currency}
                  {data?.findSaleOrder.discount_type === "PORCENTUAL"
                    ? ` (${data?.findSaleOrder.discount_value}%)`
                    : ""}
                </span>
                {data?.findSaleOrder.status === orderStatus.BORRADOR && (
                  <Button
                    icon="pi pi-times"
                    size="small"
                    severity="secondary"
                    text
                    rounded
                    tooltip="Quitar descuento general"
                    onClick={handleClearOrderDiscount}
                  />
                )}
              </div>
            </>
          )}
          <span className="text-xs text-gray-400 mt-1">Total de compra</span>
          <span className="text-2xl font-bold text-green-600">
            {`${data?.findSaleOrder.total} ${currency}`}
          </span>
        </section>

      </div>

      {/* ── Dialog de devolución parcial ───────────────────────── */}
      <Dialog
        header={existingReturn
          ? `Agregar items a devolución — ${existingReturn.code}`
          : `Registrar devolución — ${data?.findSaleOrder.code}`}
        visible={showReturnDialog}
        onHide={handleCloseDialog}
        style={{ width: "560px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancelar" severity="secondary" outlined onClick={handleCloseDialog} />
            <Button
              label={existingReturn ? "Agregar items" : "Confirmar devolución"}
              icon="pi pi-replay"
              severity="warning"
              onClick={handleCreateReturn}
              disabled={!hasSelectedItems || (!existingReturn && !returnReason.trim())}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          {existingReturn ? (
            <p className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
              Los productos seleccionados se agregarán a la devolución <strong>{existingReturn.code}</strong>.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Indica la cantidad a devolver por producto. Deja en <strong>0</strong> los que no se devuelven.
            </p>
          )}

          {/* Botón devolver todo */}
          {!loadingDetails && details.length > 0 && (
            <div className="flex justify-end">
              <Button
                label="Devolver todo"
                icon="pi pi-replay"
                size="small"
                severity="warning"
                outlined
                onClick={handleSelectAll}
              />
            </div>
          )}

          {/* Lista de productos / estado vacío */}
          {loadingDetails ? (
            <div className="flex justify-center py-4">
              <i className="pi pi-spin pi-spinner text-2xl text-gray-400" />
            </div>
          ) : details.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
              <i className="pi pi-check-circle text-3xl text-green-400" />
              <span className="text-sm">Todos los productos de esta venta ya fueron devueltos.</span>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {details.map((detail: any, idx: number) => (
                <div
                  key={detail._id}
                  className={`flex items-center justify-between gap-3 px-3 py-2 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700 text-sm break-words leading-snug">
                      {detail.product?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Disponible: {detail.quantity}</p>
                  </div>
                  <InputNumber
                    value={returnQuantities[detail._id] ?? 0}
                    onValueChange={(e) =>
                      setReturnQuantities((prev) => ({
                        ...prev,
                        [detail._id]: Math.min(Math.max(e.value ?? 0, 0), detail.quantity),
                      }))
                    }
                    min={0}
                    max={detail.quantity}
                    showButtons
                    buttonLayout="horizontal"
                    decrementButtonClassName="p-button-secondary p-button-sm"
                    incrementButtonClassName="p-button-secondary p-button-sm"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    inputStyle={{ width: "2.5rem", textAlign: "center", fontSize: "0.85rem" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Resumen de lo seleccionado */}
          {hasSelectedItems && (
            <div className="flex justify-end text-sm font-medium text-orange-600">
              Total a devolver:{" "}
              {parseFloat(
                Object.entries(returnQuantities)
                  .filter(([, qty]) => qty > 0)
                  .reduce((acc, [id, qty]) => {
                    const detail = details.find((d: any) => d._id === id);
                    return acc + (detail?.sale_price ?? 0) * qty;
                  }, 0)
                  .toFixed(2)
              )}{" "}
              {currency}
            </div>
          )}

          {/* Motivo — solo para devoluciones nuevas */}
          {!existingReturn && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Motivo <span className="text-red-500">*</span>
              </label>
              <InputTextarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={2}
                placeholder="Ej: Producto defectuoso, cliente cambió de opinión..."
                autoResize
              />
            </div>
          )}
        </div>
      </Dialog>

      {/* ── Dialog de aprobación con descuento opcional ─────────── */}
      <Dialog
        header={`Aprobar venta — ${data?.findSaleOrder.code}`}
        visible={showApproveDialog}
        onHide={() => setShowApproveDialog(false)}
        style={{ width: "500px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancelar" severity="secondary" outlined onClick={() => setShowApproveDialog(false)} />
            <Button
              label="Confirmar y aprobar"
              icon="pi pi-check-circle"
              severity="success"
              onClick={handleConfirmApprove}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          {/* Descuento general opcional */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-orange-700">Descuento general (opcional)</p>
            <div className="flex flex-col gap-2">
              <SelectButton
                value={orderDiscountType}
                options={DISCOUNT_TYPE_OPTIONS}
                onChange={(e) => {
                  const val = (e.value as string) ?? "NONE";
                  setOrderDiscountType(val);
                  if (val === "NONE") setOrderDiscountValue(null);
                }}
                className="text-sm w-full"
              />
              {orderDiscountType !== "NONE" && (
                <input
                  type="number"
                  value={orderDiscountValue ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : parseFloat(e.target.value);
                    setOrderDiscountValue(isNaN(val as number) ? null : val);
                  }}
                  placeholder={orderDiscountType === "PORCENTUAL" ? "%" : currency}
                  min={0}
                  max={orderDiscountType === "PORCENTUAL" ? 100 : undefined}
                  className="p-inputtext p-component w-full text-sm"
                />
              )}
            </div>
          </div>

          {/* Preview de totales */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal productos:</span>
              <span className="font-medium">{sumSubtotals.toFixed(2)} {currency}</span>
            </div>
            {previewDiscount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>
                  Descuento general{orderDiscountType === "PORCENTUAL" ? ` (${orderDiscountValue}%)` : ""}:
                </span>
                <span>-{previewDiscount.toFixed(2)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-green-700 border-t pt-1 mt-0.5">
              <span>Total final:</span>
              <span>{previewTotal.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      </Dialog>

      {/* ── Dialog detalle de devolución ───────────────────────── */}
      <Dialog
        header={`Devolución ${existingReturn?.code ?? ""}`}
        visible={showReturnDetailDialog}
        onHide={() => setShowReturnDetailDialog(false)}
        style={{ width: "520px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end pt-2">
            <Button label="Cerrar" severity="secondary" outlined onClick={() => setShowReturnDetailDialog(false)} />
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          {existingReturn?.reason && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Motivo:</span> {existingReturn.reason}
            </p>
          )}

          {loadingReturnDetail ? (
            <div className="flex justify-center py-4">
              <i className="pi pi-spin pi-spinner text-2xl text-gray-400" />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-center">Cantidad</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {returnDetails.map((item: any, idx: number) => (
                    <tr key={item._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 font-medium text-gray-700">{item.product?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{item.subtotal} {currency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-orange-50 font-semibold text-orange-700">
                  <tr>
                    <td className="px-3 py-2" colSpan={2}>Total devuelto</td>
                    <td className="px-3 py-2 text-right">{existingReturn?.total} {currency}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default SaleOrderDetail;
