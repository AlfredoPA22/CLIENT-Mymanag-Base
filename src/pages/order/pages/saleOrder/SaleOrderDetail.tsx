import { useApolloClient, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { OrderSkeleton } from "../../../../components/skeleton/OrderSkeleton";
import {
  APPROVE_SALE_ORDER,
  UPDATE_SALE_ORDER_DISCOUNT,
  UPDATE_SALE_ORDER_PAYMENT_METHOD,
} from "../../../../graphql/mutations/SaleOrder";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { saleOrderPaymentMethodOptions } from "../../utils/saleOrderPaymentMethodMock";
import { getSalePaymentMethodOptions } from "../../utils/salePaymentMethodMock";
import useQrPaymentAvailable from "../../../../hooks/useQrPaymentAvailable";
import { CREATE_SALE_RETURN } from "../../../../graphql/mutations/SaleReturn";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_QR_PAYMENT_INFO_BY_SALE_ORDER,
  FIND_SALE_ORDER,
  FIND_SALE_ORDER_TO_PDF,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
import { LIST_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import { LIST_SALE_PAYMENT_BY_SALE_ORDER } from "../../../../graphql/queries/SalePayment";
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
import { convertCurrency, formatAmount } from "../../../../utils/currency";
import { PermissionGuard } from "../../../auth/pages/PermissionGuard";
import QrPaymentModal from "../../../../components/qrPayment/QrPaymentModal";
import { getSocket } from "../../../../utils/socket";
import { generatePDF } from "../../utils/generateSaleOrderPDF";
import GeneralDiscountEditor from "../shared/GeneralDiscountEditor";

interface SaleOrderDetailProps {
  saleOrderId: string;
  viewCurrency: string | null;
  onViewCurrencyChange: (currency: string) => void;
}

interface ReturnItem {
  saleOrderDetailId: string;
  quantity: number;
}

const SaleOrderDetail: FC<SaleOrderDetailProps> = ({ saleOrderId, viewCurrency, onViewCurrencyChange }) => {
  const { data, loading: loadingSaleOrder, error: errorSaleOrder, refetch: refetchSaleOrder } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "cache-and-network",
  });

  const apolloClient = useApolloClient();
  const markSaleOrderPaid = () => {
    apolloClient.cache.modify({
      id: apolloClient.cache.identify({ __typename: "SaleOrder", _id: saleOrderId }),
      fields: { is_paid: () => true },
    });
    refetchSaleOrder();
  };

  const navigate = useNavigate();
  const location = useLocation();
  // SaleOrderDetail se reusa tanto en la ruta de "ver" como dentro de
  // EditSaleOrder.tsx (la ruta de edición ya la renderiza) — si ya estamos
  // ahí, no tiene sentido mostrar un botón que navegue a la misma pantalla.
  const isEditRoute = location.pathname.includes(ROUTES_MOCK.EDIT_SALE_ORDER);
  const dispatch = useDispatch();
  const { currency } = useAuth();
  const qrAvailable = useQrPaymentAvailable();

  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showReturnDetailDialog, setShowReturnDetailDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

  const [orderDiscountType, setOrderDiscountType] = useState<string>("NONE");
  const [orderDiscountValue, setOrderDiscountValue] = useState<number | null>(null);

  const [showQrDialog, setShowQrDialog] = useState(false);

  const [showEditPaymentMethodDialog, setShowEditPaymentMethodDialog] = useState(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState("Contado");
  const [editContadoPaymentMethod, setEditContadoPaymentMethod] = useState("Efectivo");

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

  const { data: salePaymentData } = useQuery(LIST_SALE_PAYMENT_BY_SALE_ORDER, {
    variables: { saleOrderId },
    skip: data?.findSaleOrder.payment_method !== "Credito",
  });
  const salePayments: any[] = salePaymentData?.listSalePaymentBySaleOrder ?? [];

  const { data: qrPaymentInfoData } = useQuery(FIND_QR_PAYMENT_INFO_BY_SALE_ORDER, {
    variables: { saleOrderId },
    skip:
      !data?.findSaleOrder.is_paid ||
      data?.findSaleOrder.payment_method !== "Contado" ||
      data?.findSaleOrder.contado_payment_method !== "QR",
  });
  const qrPaymentInfo = qrPaymentInfoData?.findQrPaymentInfoBySaleOrder;

  const handleGeneratePDF = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data: pdfData } = await apolloClient.query({
        query: FIND_SALE_ORDER_TO_PDF,
        variables: { saleOrderId },
        fetchPolicy: "network-only",
      });
      const { data: dataCompany } = await apolloClient.query({
        query: DETAIL_COMPANY,
        fetchPolicy: "network-only",
      });
      generatePDF(pdfData.findSaleOrderToPDF, dataCompany.detailCompany, currency, effectiveViewCurrency);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleOpenTicket = () => {
    window.open(
      `${ROUTES_MOCK.SALE_ORDERS}/detalle/${saleOrderId}/ticket?currency=${effectiveViewCurrency}`,
      "_blank"
    );
  };

  const handleOpenReturnDetail = () => {
    if (existingReturn) {
      loadReturnDetail({ variables: { saleReturnId: existingReturn._id } });
      setShowReturnDetailDialog(true);
    }
  };

  // Los ítems sin inventario no se pueden devolver desde acá (no hay stock
  // que reponer) — se anula la venta si hace falta revertirlos.
  const details: any[] = (detailsData?.listSaleOrderDetail ?? []).filter(
    (d: any) => d.product
  );

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

  const [updateSaleOrderPaymentMethod] = useMutation(UPDATE_SALE_ORDER_PAYMENT_METHOD, {
    refetchQueries: [{ query: FIND_SALE_ORDER, variables: { saleOrderId } }],
  });

  const handleOpenEditPaymentMethodDialog = () => {
    setEditPaymentMethod(data?.findSaleOrder.payment_method ?? "Contado");
    setEditContadoPaymentMethod(data?.findSaleOrder.contado_payment_method ?? "Efectivo");
    setShowEditPaymentMethodDialog(true);
  };

  const handleSavePaymentMethod = async () => {
    try {
      dispatch(setIsBlocked(true));
      await updateSaleOrderPaymentMethod({
        variables: {
          saleOrderId,
          payment_method: editPaymentMethod,
          contado_payment_method:
            editPaymentMethod === "Contado" ? editContadoPaymentMethod : undefined,
        },
      });
      setShowEditPaymentMethodDialog(false);
      showToast({ detail: "Método de pago actualizado", severity: ToastSeverity.Success });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

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

  useEffect(() => {
    const socket = getSocket();
    const join = () => socket.emit("join_sale_order", saleOrderId);
    join();
    socket.on("connect", join);

    const handleUpdate = (payload: { saleOrderId: string; status: string }) => {
      if (payload.saleOrderId === saleOrderId && payload.status === "completed_transaction") {
        markSaleOrderPaid();
      }
    };

    socket.on("sale_order_payment_update", handleUpdate);
    return () => {
      socket.off("connect", join);
      socket.off("sale_order_payment_update", handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleOrderId]);

  const hasSelectedItems = Object.values(returnQuantities).some((qty) => qty > 0);

  // Moneda de la nota: la nota siempre se guarda/muestra por defecto en la
  // moneda en la que realmente se vendió.
  const noteCurrency = data?.findSaleOrder.currency ?? currency;

  const returnTotal = Object.entries(returnQuantities)
    .filter(([, qty]) => qty > 0)
    .reduce((acc, [id, qty]) => {
      const detail = details.find((d: any) => d._id === id);
      return acc + (detail?.sale_price ?? 0) * qty;
    }, 0);

  let refundAmount = 0;
  if (data?.findSaleOrder.payment_method === "Contado" && data?.findSaleOrder.is_paid) {
    refundAmount = returnTotal;
  } else if (data?.findSaleOrder.payment_method === "Credito") {
    // Cada abono puede estar en una moneda distinta a la de la venta — hay
    // que convertirlo a la moneda de la venta (con su propio tipo de cambio
    // congelado) antes de sumarlo, si no el saldo queda mal calculado.
    const totalPaid = salePayments.reduce(
      (acc, p) => acc + convertCurrency(p.amount ?? 0, p.currency ?? currency, noteCurrency, p.exchange_rate),
      0
    );
    const newTotal = (data?.findSaleOrder.total ?? 0) - returnTotal;
    refundAmount = Math.max(totalPaid - Math.max(newTotal, 0), 0);
  }

  const handleSelectAll = () => {
    const all: Record<string, number> = {};
    details.forEach((d: any) => { all[d._id] = d.quantity; });
    setReturnQuantities(all);
  };
  // Subtotal de productos = total actual + descuento general ya aplicado (viene de DB)
  const sumSubtotals = parseFloat(((data?.findSaleOrder.total ?? 0) + (data?.findSaleOrder.discount_amount ?? 0)).toFixed(2));

  // Si además tiene un tipo de cambio guardado (toda venta de una empresa
  // en $ lo tiene, aunque se haya vendido en $ o en Bs), se puede alternar
  // la vista a la otra moneda usando ese tipo de cambio (el que había al
  // momento de crear la nota, no se recalcula con el tipo de cambio actual
  // de la empresa).
  const otherCurrency = noteCurrency === "Bs" ? "$" : "Bs";
  const exchangeRate = data?.findSaleOrder.exchange_rate;
  // El toggle de vista solo tiene sentido una vez la venta está aprobada
  // (el total ya no cambia) — en Borrador el monto todavía puede variar
  // mientras se agregan/editan productos, así que no se permite alternar.
  const hasAltCurrency = !!exchangeRate && data?.findSaleOrder.status === orderStatus.APROBADO;
  const effectiveViewCurrency = viewCurrency ?? noteCurrency;
  const convertAmount = (amount: number) =>
    convertCurrency(amount, noteCurrency, effectiveViewCurrency, exchangeRate);

  const date = getDate(data?.findSaleOrder.date) || "";

  if (loadingSaleOrder && !data) return <OrderSkeleton />;

  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      <SectionHeader
        title={isEditRoute ? "Editar venta" : "Detalle de venta"}
        subtitle={
          isEditRoute
            ? "Agrega o quita productos y ajusta lo que necesites antes de aprobar la venta."
            : "Consulta la información de tu venta y realiza cambios si es necesario."
        }
        actions={
          <Button
            label="Volver a la lista"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={() => navigate(-1)}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-center">

        {/* Código / estado / acciones — order-1 en mobile/tablet para que aparezca primero */}
        <section className="flex flex-col gap-4 rounded-md order-1 lg:order-3">
          <div className="flex flex-col items-center gap-3 lg:gap-2 bg-gray-100 px-4 py-3 lg:p-4 rounded-xl">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-gray-500 text-xs">Código de Orden</span>
              <span className="text-lg lg:text-xl font-bold text-gray-800">
                {data?.findSaleOrder.code}
              </span>
              {data?.findSaleOrder.source === "tienda_online" && (
                <Tag severity="info" icon="pi pi-shopping-bag">Pedido de la tienda</Tag>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:flex-col lg:flex-nowrap lg:gap-2">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-gray-500 text-xs">Estado de venta</span>
                <Tag
                  severity={getStatus(data?.findSaleOrder.status)?.severity as "danger" | "success" | "info" | "warning"}
                >
                  {getStatus(data?.findSaleOrder.status)?.label}
                </Tag>
              </div>
              {((data?.findSaleOrder.payment_method === "Contado" &&
                data?.findSaleOrder.contado_payment_method === "QR") ||
                data?.findSaleOrder.payment_method === "Credito") && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-gray-500 text-xs">Estado de pago</span>
                    <Tag severity={data?.findSaleOrder.is_paid ? "success" : "warning"}>
                      {data?.findSaleOrder.is_paid ? "Pagado" : "Pendiente"}
                    </Tag>
                  </div>
                )}
            </div>
          </div>

          {qrPaymentInfo?.exchange_rate && (
            <div className="flex flex-col items-center gap-1 rounded-xl bg-blue-50 border border-blue-100 px-4 py-2">
              <span className="text-blue-700 text-xs font-medium">
                TC: 1 $ = {formatAmount(qrPaymentInfo.exchange_rate)} Bs
              </span>
              <span className="text-blue-900 text-sm font-semibold">
                {formatAmount(qrPaymentInfo.amount)} $ × {formatAmount(qrPaymentInfo.exchange_rate)} ={" "}
                {formatAmount(qrPaymentInfo.amount_bob ?? 0)} Bs
              </span>
            </div>
          )}

          <PermissionGuard permissions={["DETAIL_SALE"]}>
            <div className="flex flex-col gap-2">
              <Button
                icon="pi pi-download"
                type="button"
                severity="secondary"
                label="Imprimir venta"
                outlined
                className="w-full"
                onClick={handleGeneratePDF}
              />
              {data?.findSaleOrder.status === orderStatus.APROBADO && (
                <Button
                  icon="pi pi-print"
                  type="button"
                  severity="secondary"
                  label="Imprimir ticket (térmica)"
                  outlined
                  className="w-full"
                  onClick={handleOpenTicket}
                />
              )}
            </div>
          </PermissionGuard>

          {data?.findSaleOrder.status === orderStatus.BORRADOR && (
            <PermissionGuard permissions={["CREATE_SALE", "EDIT_SALE"]}>
              <div className="flex flex-col gap-2">
                {!isEditRoute && (
                  <Button
                    icon="pi pi-pencil"
                    type="button"
                    severity="info"
                    label="Editar venta"
                    outlined
                    className="w-full justify-center"
                    onClick={() => navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.EDIT_SALE_ORDER}/${saleOrderId}`)}
                  />
                )}
                <Button
                  icon="pi pi-check-circle"
                  type="button"
                  severity="success"
                  label="Aprobar venta"
                  className="w-full justify-center"
                  onClick={handleOpenApproveDialog}
                />
              </div>
            </PermissionGuard>
          )}

          {data?.findSaleOrder.status === orderStatus.APROBADO && (
            <div className="flex flex-col gap-2">
              {data?.findSaleOrder.payment_method === "Contado" &&
                data?.findSaleOrder.contado_payment_method === "QR" &&
                !data?.findSaleOrder.is_paid && (
                  <PermissionGuard permissions={["CREATE_SALE", "EDIT_SALE"]}>
                    {qrAvailable ? (
                      <Button
                        icon="pi pi-qrcode"
                        type="button"
                        severity="info"
                        label="Generar QR de cobro"
                        onClick={() => setShowQrDialog(true)}
                        className="w-full"
                      />
                    ) : (
                      <Button
                        icon="pi pi-qrcode"
                        type="button"
                        severity="info"
                        label="QR de cobro (Próximamente)"
                        disabled
                        className="w-full"
                        tooltip="El cobro por QR no está disponible en este momento"
                      />
                    )}
                  </PermissionGuard>
                )}
              {data?.findSaleOrder.payment_method === "Credito" && (
                <PermissionGuard permissions={["LIST_PAYMENT"]}>
                  <Button
                    icon="pi pi-wallet"
                    type="button"
                    severity="info"
                    label="Ver pagos"
                    outlined
                    onClick={() =>
                      navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.SALE_PAYMENT}/${saleOrderId}`)
                    }
                    className="w-full"
                  />
                </PermissionGuard>
              )}
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

          {data?.findSaleOrder.status === orderStatus.DEVUELTO && (
            <div className="flex flex-col gap-2">
              {existingReturn && (
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
              {data?.findSaleOrder.payment_method === "Credito" && (
                <PermissionGuard permissions={["LIST_PAYMENT"]}>
                  <Button
                    icon="pi pi-wallet"
                    type="button"
                    severity="info"
                    label="Ver pagos"
                    outlined
                    onClick={() =>
                      navigate(`${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.SALE_PAYMENT}/${saleOrderId}`)
                    }
                    className="w-full"
                  />
                </PermissionGuard>
              )}
            </div>
          )}
        </section>

        {/* Info de la orden — order-2 en mobile/tablet */}
        <section className="flex flex-col gap-3 order-2 lg:order-1 lg:border-r lg:border-gray-300 lg:pr-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Fecha de venta</span>
              <span className="text-base font-medium text-gray-700">{date}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Condición de pago</span>
              <div className="flex items-center gap-1">
                <span className="text-base font-medium text-gray-700">
                  {data?.findSaleOrder.payment_method}
                </span>
                {data?.findSaleOrder.status === orderStatus.BORRADOR && (
                  <PermissionGuard permissions={["CREATE_SALE", "EDIT_SALE"]}>
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      severity="secondary"
                      text
                      rounded
                      tooltip="Editar método de pago"
                      onClick={handleOpenEditPaymentMethodDialog}
                    />
                  </PermissionGuard>
                )}
              </div>
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
          {/* Notas viejas (previas a este campo) no tienen almacén de
              cabecera — no se muestra nada en ese caso. */}
          {data?.findSaleOrder.warehouse && (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Almacén</span>
              <span className="text-base font-medium text-gray-700">
                {data?.findSaleOrder.warehouse.name}
              </span>
            </div>
          )}
        </section>

        {/* Totales — order-3 en mobile/tablet (al final) */}
        <section className="flex flex-col items-center justify-center gap-1 text-center order-3 lg:order-2 bg-green-50 lg:bg-transparent rounded-xl lg:rounded-none py-3 lg:py-0">
          {hasAltCurrency && (
            <div className="flex flex-col items-center gap-1 mb-1">
              <span className="text-xs text-blue-600">
                Nota creada en {noteCurrency} · TC: 1 $ = {formatAmount(exchangeRate ?? 0)} Bs
              </span>
              <div className="flex gap-1">
                {[noteCurrency, otherCurrency].map((opt) => (
                  <Button
                    key={opt}
                    label={opt}
                    size="small"
                    severity={effectiveViewCurrency === opt ? "info" : "secondary"}
                    outlined={effectiveViewCurrency !== opt}
                    onClick={() => onViewCurrencyChange(opt)}
                  />
                ))}
              </div>
            </div>
          )}
          {(data?.findSaleOrder.discount_amount ?? 0) > 0 && (
            <>
              <span className="text-xs text-gray-400">Subtotal productos</span>
              <span className="text-sm text-gray-600">
                {`${formatAmount(convertAmount((data?.findSaleOrder.total ?? 0) + (data?.findSaleOrder.discount_amount ?? 0)))} ${effectiveViewCurrency}`}
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs text-orange-500">
                  Descuento general: -{formatAmount(convertAmount(data?.findSaleOrder.discount_amount ?? 0))} {effectiveViewCurrency}
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
            {`${formatAmount(convertAmount(data?.findSaleOrder.total ?? 0))} ${effectiveViewCurrency}`}
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
              Total a devolver: {formatAmount(returnTotal)} {noteCurrency}
            </div>
          )}

          {hasSelectedItems && refundAmount > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                <i className="pi pi-exclamation-triangle text-2xl" />
                <span>¡Esta devolución genera saldo a favor del cliente!</span>
              </div>
              <p className="text-sm bg-red-50 border border-red-200 rounded px-3 py-2 text-red-700">
                Esta devolución implica reembolsar{" "}
                <strong>{formatAmount(refundAmount)} {noteCurrency}</strong> al cliente, y ese reembolso debe gestionarse manualmente.
              </p>
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
        <GeneralDiscountEditor
          discountType={orderDiscountType}
          discountValue={orderDiscountValue}
          onChangeType={setOrderDiscountType}
          onChangeValue={setOrderDiscountValue}
          subtotal={sumSubtotals}
          currency={noteCurrency}
        />
      </Dialog>

      {/* ── Dialog de edición de método de pago ─────────────────── */}
      <Dialog
        header={`Editar método de pago — ${data?.findSaleOrder.code}`}
        visible={showEditPaymentMethodDialog}
        onHide={() => setShowEditPaymentMethodDialog(false)}
        style={{ width: "420px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button
              label="Cancelar"
              severity="secondary"
              outlined
              onClick={() => setShowEditPaymentMethodDialog(false)}
            />
            <Button label="Guardar" icon="pi pi-check" onClick={handleSavePaymentMethod} />
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-1">
          <DropdownInput
            label="Condición de pago"
            name="editPaymentMethod"
            optionLabel="label"
            mandatory
            options={saleOrderPaymentMethodOptions}
            value={editPaymentMethod}
            onChange={(e) => setEditPaymentMethod(e.value)}
          />
          {editPaymentMethod === "Contado" && (
            <DropdownInput
              label="Método de pago"
              name="editContadoPaymentMethod"
              optionLabel="label"
              mandatory
              options={getSalePaymentMethodOptions(qrAvailable)}
              optionDisabled="disabled"
              value={editContadoPaymentMethod}
              onChange={(e) => setEditContadoPaymentMethod(e.value)}
            />
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
              <table className="w-full text-sm table-fixed">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left w-[55%]">Producto</th>
                    <th className="px-3 py-2 text-center w-[15%]">Cant.</th>
                    <th className="px-3 py-2 text-right w-[30%]">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {returnDetails.map((item: any, idx: number) => (
                    <tr key={item._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 font-medium text-gray-700 break-words">{item.product?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-center text-gray-500">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{formatAmount(item.subtotal)} {noteCurrency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-orange-50 font-semibold text-orange-700">
                  <tr>
                    <td className="px-3 py-2" colSpan={2}>Total devuelto</td>
                    <td className="px-3 py-2 text-right">{formatAmount(existingReturn?.total ?? 0)} {noteCurrency}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </Dialog>

      <QrPaymentModal
        visible={showQrDialog}
        onHide={() => setShowQrDialog(false)}
        amount={data?.findSaleOrder.total ?? 0}
        referenceId={`VENTA-${data?.findSaleOrder.code ?? saleOrderId}`}
        description={`Pago venta ${data?.findSaleOrder.code ?? ""}`}
        saleOrderId={saleOrderId}
        type="venta_contado"
        onConfirmed={markSaleOrderPaid}
      />
    </div>
  );
};

export default SaleOrderDetail;
