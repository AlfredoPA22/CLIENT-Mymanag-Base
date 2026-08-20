import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { PermissionGuard } from "../../../auth/pages/PermissionGuard";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { SelectButton } from "primereact/selectbutton";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { canDoAny } from "../../../../casl/ability";
import { useAbility } from "../../../../casl/AbilityContext";
import CreatableAutoComplete from "../../../../components/creatableAutoComplete/CreatableAutoComplete";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { CREATE_CLIENT } from "../../../../graphql/mutations/Client";
import { UPDATE_COMPANY } from "../../../../graphql/mutations/Company";
import {
  APPROVE_SALE_ORDER,
  CREATE_SALE_ORDER,
  UPDATE_SALE_ORDER_DISCOUNT,
} from "../../../../graphql/mutations/SaleOrder";
import { GENERATE_CODE } from "../../../../graphql/queries/CodeGenerator";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { FIND_CURRENT_CASH_REGISTER } from "../../../../graphql/queries/CashRegister";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_SALE_ORDER_TO_PDF,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import {
  resetSaleOrder,
  setSaleOrder,
  setSaleOrderInitialized,
} from "../../../../redux/slices/saleOrderSlice";
import { RootState } from "../../../../redux/store";
import { codeType } from "../../../../utils/enums/codeType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { ISaleOrderInput } from "../../../../utils/interfaces/SaleOrder";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import { showToast } from "../../../../utils/toastUtils";
import useClientList from "../../../client/hooks/useClientList";
import useWarehouseList from "../../../product/hooks/useWarehouseList";
import { getStatus } from "../../utils/getStatus";
import { schemaFormSaleOrder } from "../../validations/FormSaleOrderValidation";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { saleOrderPaymentMethodOptions } from "../../utils/saleOrderPaymentMethodMock";
import { getSalePaymentMethodOptions } from "../../utils/salePaymentMethodMock";
import useQrPaymentAvailable from "../../../../hooks/useQrPaymentAvailable";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import useAuth from "../../../auth/hooks/useAuth";
import { formatAmount } from "../../../../utils/currency";
import { generatePDF } from "../../utils/generateSaleOrderPDF";
import GeneralDiscountEditor from "../shared/GeneralDiscountEditor";

const SaleOrderForm = () => {
  const {
    data: { generateCode: codeOrder } = "",
    error: errorCodeOrder,
    refetch: refetchCodeOrder,
  } = useQuery(GENERATE_CODE, {
    variables: { type: codeType.SALE_ORDER },
    fetchPolicy: "network-only",
  });

  const { listClientSelect, refetchListClient } = useClientList();
  const { listWarehouse: listWarehouseRaw } = useWarehouseList();
  const listWarehouse = listWarehouseRaw ?? [];
  const { currency } = useAuth();
  const qrAvailable = useQrPaymentAvailable();
  const client = useApolloClient();
  const ability = useAbility();
  const canEditCompany = canDoAny(ability, ["UPDATE_COMPANY"]);

  const { data: companyData, refetch: refetchCompany } = useQuery(DETAIL_COMPANY);
  const company = companyData?.detailCompany;

  const { data: cashRegisterData, loading: loadingCashRegister } = useQuery(FIND_CURRENT_CASH_REGISTER);
  const hasOpenCashRegister = !!cashRegisterData?.findCurrentCashRegister;

  const [selectedClient, setSelectedClient] = useState<IReactSelect | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Contado");
  const [selectedContadoPaymentMethod, setSelectedContadoPaymentMethod] =
    useState("Efectivo");
  const [selectedNoteCurrency, setSelectedNoteCurrency] = useState<string>("$");
  const [selectedWarehouse, setSelectedWarehouse] = useState<IWarehouse | null>(null);
  const [rateInput, setRateInput] = useState<number | null>(null);
  const [updateCompany, { loading: savingRate }] = useMutation(UPDATE_COMPANY);

  // Toda venta de una empresa en dólares guarda el tipo de cambio (para
  // poder verse después en Bs), así que no se puede registrar ninguna venta
  // sin uno configurado, sin importar en qué moneda se venda esta nota.
  const needsExchangeRate = company?.currency === "$" && !company?.exchange_rate;

  const handleSaveExchangeRate = async () => {
    if (!rateInput || rateInput <= 0) return;
    try {
      await updateCompany({ variables: { input: { exchange_rate: rateInput } } });
      await refetchCompany();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const navigate = useNavigate();

  const [createSaleOrder] = useMutation(CREATE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }],
  });

  const [approveSaleOrder] = useMutation(APPROVE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  const [updateSaleOrderDiscount] = useMutation(UPDATE_SALE_ORDER_DISCOUNT);

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [orderDiscountType, setOrderDiscountType] = useState<string>("NONE");
  const [orderDiscountValue, setOrderDiscountValue] = useState<number | null>(null);

  // Sin refetchQueries acá — mismo bug de select vacío ya encontrado en
  // ProductForm.tsx/PurchaseOrderDetailForm.tsx/SaleOrderPOS.tsx. Se llama a
  // refetchListClient directamente en onCreateClient.
  const [createClient] = useMutation(CREATE_CLIENT);

  const { saleOrderInitialized, saleOrderData } = useSelector(
    (state: RootState) => state.saleOrderSlice
  );

  const dispatch = useDispatch();

  const initialValues: ISaleOrderInput = {
    date: new Date(),
    client: "",
    payment_method: "Contado",
    contado_payment_method: "Efectivo",
    warehouse: "",
  };

  useEffect(() => {
    if (errorCodeOrder) {
      showToast({
        detail: errorCodeOrder.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [errorCodeOrder]);

  const onSubmit = async () => {
    const order: ISaleOrderInput = {
      date: values.date,
      client: values.client,
      payment_method: values.payment_method,
      contado_payment_method:
        values.payment_method === "Contado"
          ? values.contado_payment_method
          : undefined,
      currency:
        company?.currency === "$" && selectedNoteCurrency === "Bs"
          ? "Bs"
          : undefined,
      warehouse: values.warehouse || undefined,
    };

    const { data } = await createSaleOrder({ variables: order });

    dispatch(setSaleOrder(data.createSaleOrder));
    dispatch(setSaleOrderInitialized(true));
  };

  const handleResetSaleOrder = async (e: any) => {
    e.preventDefault();
    dispatch(resetSaleOrder());
    setSelectedClient(null);
    setSelectedPaymentMethod("Contado");
    setSelectedContadoPaymentMethod("Efectivo");
    setSelectedNoteCurrency("$");
    setSelectedWarehouse(null);
    await refetchCodeOrder();
    resetForm();
  };

  const handleOpenApproveDialog = () => {
    setOrderDiscountType("NONE");
    setOrderDiscountValue(null);
    setShowApproveDialog(true);
  };

  const handleConfirmApprove = async () => {
    try {
      dispatch(setIsBlocked(true));
      // Siempre sincroniza el descuento a DB antes de aprobar (incluye limpiarlo si es NONE)
      await updateSaleOrderDiscount({
        variables: {
          saleOrderId: saleOrderData?._id,
          discount_type: orderDiscountType === "NONE" ? null : orderDiscountType,
          discount_value: orderDiscountType === "NONE" ? null : (orderDiscountValue ?? null),
        },
      });
      const { data } = await approveSaleOrder({
        variables: { saleOrderId: saleOrderData?._id },
      });
      if (data) {
        showToast({
          detail: "Venta Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        setShowApproveDialog(false);
        navigate(
          `${ROUTES_MOCK.SALE_ORDERS}/detalle/${data.approveSaleOrder._id}`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleGeneratePDF = async () => {
    if (!saleOrderData?._id) return;
    try {
      dispatch(setIsBlocked(true));
      const { data } = await client.query({
        query: FIND_SALE_ORDER_TO_PDF,
        variables: { saleOrderId: saleOrderData._id },
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

  const handleClientChange = (value: IReactSelect | null) => {
    setSelectedClient(value);
    setFieldValue("client", value ? value.value : "");
  };

  const onCreateClient = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createClient({
        variables: {
          fullName: inputValue,
          email: "",
          address: "",
          phoneNumber: "",
        },
      });

      if (data) {
        showToast({
          detail: "Cliente creado",
          severity: ToastSeverity.Success,
        });

        setSelectedClient({
          value: data.createClient._id,
          label: data.createClient.fullName,
        });

        setFieldValue("client", data.createClient._id);
        await refetchListClient();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handlePaymentMethodChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedPaymentMethod(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const handleContadoPaymentMethodChange = async (
    e: AutoCompleteChangeEvent
  ) => {
    const { value } = e.target;
    setSelectedContadoPaymentMethod(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const {
    handleChange,
    handleSubmit,
    values,
    isValid,
    isSubmitting,
    errors,
    resetForm,
    setFieldValue,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Orden de venta creada",
    handleSubmit: onSubmit,
    validationSchema: schemaFormSaleOrder,
  });

  // Si la empresa tiene un solo almacén, no tiene sentido preguntar — se
  // autoasigna en silencio, igual que ya se hace en el modo POS.
  useEffect(() => {
    if (listWarehouse.length === 1 && !selectedWarehouse && !saleOrderInitialized) {
      setSelectedWarehouse(listWarehouse[0]);
      setFieldValue("warehouse", listWarehouse[0]._id);
    }
  }, [listWarehouse, selectedWarehouse, saleOrderInitialized]);

  // Una vez creada la nota, el campo queda deshabilitado y ya no depende de
  // que el usuario elija nada — se recupera solo desde la nota guardada
  // (Redux) si por lo que sea el estado local queda vacío, en vez de mostrar
  // el campo en blanco pese a que la nota sí tiene almacén.
  useEffect(() => {
    if (saleOrderInitialized && saleOrderData?.warehouse && !selectedWarehouse) {
      setSelectedWarehouse(saleOrderData.warehouse as unknown as IWarehouse);
    }
  }, [saleOrderInitialized, saleOrderData, selectedWarehouse]);

  const handleWarehouseChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedWarehouse(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  // Solo importa avisar cuando el efectivo de esta venta vaya a entrar a una
  // caja física — Transferencia/QR/Crédito no pasan por la caja. Es solo un
  // aviso: no bloquea la venta, para no frenar a nadie a mitad de un cobro.
  const isCashSale =
    values.payment_method === "Contado" && values.contado_payment_method === "Efectivo";
  const showNoCashRegisterWarning =
    isCashSale && !loadingCashRegister && !hasOpenCashRegister && !saleOrderInitialized;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2"
    >
      <div className="flex flex-col items-center text-center gap-2 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">
          Nueva Orden de Venta
        </h2>
        <p className="text-gray-500 text-sm">
          Completa los detalles para registrar la venta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Información del cliente y fecha */}
        <section className="flex flex-col gap-3 border-r lg:border-r-gray-300 lg:pr-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <LabelInput name="date" label="Fecha de venta" />
              <Calendar
                name="date"
                value={values.date}
                onChange={handleChange}
                showIcon
                disabled={saleOrderInitialized}
              />
            </div>

            <DropdownInput
              label="Condición de pago"
              name="payment_method"
              optionLabel="label"
              placeholder="Seleccionar condición"
              mandatory
              options={saleOrderPaymentMethodOptions}
              value={selectedPaymentMethod}
              error={errors.payment_method ? errors.payment_method : ""}
              onChange={handlePaymentMethodChange}
              disabled={saleOrderInitialized}
            />
          </div>

          {/* Método de pago (solo Contado) + Moneda de la venta (solo si la empresa opera en dólares) */}
          {(values.payment_method === "Contado" || company?.currency === "$") && (
            <div className="grid md:grid-cols-2 gap-5">
              {values.payment_method === "Contado" && (
                <DropdownInput
                  label="Método de pago"
                  name="contado_payment_method"
                  optionLabel="label"
                  placeholder="¿Cómo paga?"
                  mandatory
                  options={getSalePaymentMethodOptions(qrAvailable)}
                  optionDisabled="disabled"
                  value={selectedContadoPaymentMethod}
                  error={
                    errors.contado_payment_method
                      ? errors.contado_payment_method
                      : ""
                  }
                  onChange={handleContadoPaymentMethodChange}
                  disabled={saleOrderInitialized}
                />
              )}

              {company?.currency === "$" && (
                <div className="flex flex-col gap-1">
                  <LabelInput name="currency" label="Moneda de la venta" />
                  <SelectButton
                    value={selectedNoteCurrency}
                    options={[
                      { label: "$", value: "$" },
                      { label: "Bs", value: "Bs" },
                    ]}
                    onChange={(e) => setSelectedNoteCurrency(e.value ?? "$")}
                    disabled={saleOrderInitialized}
                    className="w-full flex [&_.p-button]:flex-1 [&_.p-button]:justify-center"
                  />
                </div>
              )}
            </div>
          )}

          {needsExchangeRate && (
            <div className="flex flex-col gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                No tienes un tipo de cambio configurado. No se puede registrar la venta sin eso.
              </p>
              {canEditCompany ? (
                <div className="flex flex-col gap-2">
                  <InputNumber
                    value={rateInput}
                    onValueChange={(e) => setRateInput(e.value ?? null)}
                    placeholder="Tipo de cambio (Bs por $)"
                    minFractionDigits={2}
                    maxFractionDigits={4}
                    className="w-full"
                    inputClassName="w-full"
                  />
                  <Button
                    label="Guardar tipo de cambio"
                    icon="pi pi-check"
                    severity="success"
                    size="small"
                    disabled={!rateInput || rateInput <= 0 || savingRate}
                    loading={savingRate}
                    onClick={handleSaveExchangeRate}
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Pedile a un administrador que configure el tipo de cambio en Ajustes de la empresa.
                </p>
              )}
            </div>
          )}

          {showNoCashRegisterWarning && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                No hay una caja abierta — este efectivo no se va a contar en ningún cierre de caja.
              </p>
              <Button
                type="button"
                label="Abrir caja"
                icon="pi pi-lock-open"
                severity="info"
                size="small"
                className="w-full sm:w-auto justify-center"
                onClick={() => navigate(ROUTES_MOCK.CASH_REGISTER)}
              />
            </div>
          )}

          <div className={listWarehouse.length > 1 ? "grid md:grid-cols-2 gap-5" : "grid"}>
            {listWarehouse.length > 1 && (
              <DropdownInput
                label="Almacén"
                name="warehouse"
                optionLabel="name"
                placeholder="Seleccionar almacén"
                filter
                mandatory
                options={listWarehouse}
                value={selectedWarehouse}
                error={errors.warehouse ? (errors.warehouse as string) : ""}
                onChange={handleWarehouseChange}
                disabled={saleOrderInitialized}
              />
            )}
            <CreatableAutoComplete
              label="Cliente"
              name="client"
              placeholder="Seleccionar o escribir cliente"
              mandatory
              options={listClientSelect}
              error={errors.client ? errors.client : ""}
              onChange={handleClientChange}
              onCreateOption={onCreateClient}
              value={selectedClient}
              disabled={saleOrderInitialized}
            />
          </div>
        </section>
        <div className="flex justify-center">
          {!saleOrderInitialized ? (
            <Button
              icon="pi pi-plus"
              type="submit"
              severity="success"
              label="Crear venta"
              disabled={
                !isValid ||
                isSubmitting ||
                needsExchangeRate ||
                (listWarehouse.length > 1 && !values.warehouse)
              }
            />
          ) : (
            <section className="flex flex-col items-center justify-center">
              <LabelInput name="total" label="Total de venta" />
              <span className="text-2xl font-semibold text-green-600">
                {`${formatAmount(saleOrderData?.total ?? 0)} ${currency}`}
              </span>
            </section>
          )}
        </div>

        {saleOrderInitialized && (
          <section className="flex flex-col gap-5 rounded-md">
            <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
              <span className="text-gray-600 text-sm">Código de Orden</span>
              <span className="text-xl font-bold text-gray-800">
                {codeOrder}
              </span>
              {saleOrderData?.status && (
                <Tag
                  severity={
                    getStatus(saleOrderData?.status)?.severity as
                      | "danger"
                      | "success"
                      | "info"
                      | "warning"
                  }
                >
                  {getStatus(saleOrderData?.status)?.label}
                </Tag>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <Button
                type="button"
                severity="warning"
                label="Reiniciar"
                onClick={handleResetSaleOrder}
                className="w-full sm:w-auto justify-center"
              />
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar Venta"
                onClick={handleOpenApproveDialog}
                className="w-full sm:w-auto justify-center"
              />
              <Button
                icon="pi pi-download"
                type="button"
                severity="secondary"
                label="Imprimir"
                onClick={handleGeneratePDF}
                className="w-full sm:w-auto justify-center"
              />
            </div>
          </section>
        )}
      </div>

      {/* ── Dialog de aprobación con descuento opcional ─────────── */}
      <Dialog
        header={`Aprobar venta — ${saleOrderData?.code ?? ""}`}
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
        <PermissionGuard permissions={["APPLY_DISCOUNT"]}>
          <GeneralDiscountEditor
            discountType={orderDiscountType}
            discountValue={orderDiscountValue}
            onChangeType={setOrderDiscountType}
            onChangeValue={setOrderDiscountValue}
            subtotal={(saleOrderData?.total ?? 0) + (saleOrderData?.discount_amount ?? 0)}
            currency={saleOrderData?.currency ?? currency}
          />
        </PermissionGuard>
      </Dialog>
    </form>
  );
};

export default SaleOrderForm;
