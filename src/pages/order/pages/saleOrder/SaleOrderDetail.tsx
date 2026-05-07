import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { OrderSkeleton } from "../../../../components/skeleton/OrderSkeleton";
import { APPROVE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
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
    fetchPolicy: "network-only",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showReturnDetailDialog, setShowReturnDetailDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

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

  const setApproveSaleOrder = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data: result } = await approveSaleOrder({ variables: { saleOrderId } });
      if (result) {
        showToast({ detail: "Venta Aprobada exitosamente", severity: ToastSeverity.Success });
        navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${result.approveSaleOrder._id}`);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <section className="flex flex-col gap-3 border-r md:border-r-gray-300 md:pr-6">
          <div className="grid lg:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <LabelInput name="date" label="Fecha de venta" />
              <span className="text-lg font-medium text-gray-700">{date}</span>
            </div>
            <div className="flex flex-col">
              <LabelInput name="payment_method" label="Condición de pago" />
              <span className="text-lg font-medium text-gray-700">
                {data?.findSaleOrder.payment_method}
              </span>
              {data?.findSaleOrder.payment_method === "Contado" && (
                <span className="text-sm text-gray-500 mt-0.5">
                  {data?.findSaleOrder.contado_payment_method ?? "No especificado"}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <LabelInput name="client" label="Cliente" />
            <span className="text-lg font-medium text-gray-700">
              {data?.findSaleOrder.client.fullName}
            </span>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center">
          <LabelInput name="total" label="Total de compra" />
          <span className="text-2xl font-semibold text-green-600">
            {`${data?.findSaleOrder.total} ${currency}`}
          </span>
        </section>

        <section className="flex flex-col gap-5 rounded-md">
          <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
            <span className="text-gray-600 text-sm">Código de Orden</span>
            <span className="text-xl font-bold text-gray-800">{data?.findSaleOrder.code}</span>
            <Tag
              severity={getStatus(data?.findSaleOrder.status)?.severity as "danger" | "success" | "info" | "warning"}
            >
              {getStatus(data?.findSaleOrder.status)?.label}
            </Tag>
          </div>

          {data?.findSaleOrder.status === orderStatus.BORRADOR && (
            <div className="flex flex-row justify-center gap-4">
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar venta"
                onClick={setApproveSaleOrder}
                className="mt-2"
              />
            </div>
          )}

          {data?.findSaleOrder.status === orderStatus.APROBADO && (
            <div className="flex flex-col items-center gap-2 mt-2">
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
            <div className="flex flex-col items-center gap-2 mt-2">
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
            </div>
          )}
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

          {/* Tabla de productos / estado vacío */}
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
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-center">Disponible</th>
                    <th className="px-3 py-2 text-center">A devolver</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail: any, idx: number) => (
                    <tr key={detail._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {detail.product?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500">{detail.quantity}</td>
                      <td className="px-3 py-2 text-center">
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
                          inputStyle={{ width: "3rem", textAlign: "center", fontSize: "0.85rem" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
