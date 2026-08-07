import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";

import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import { SelectButton } from "primereact/selectbutton";
import { FC, useState } from "react";
import { canDoAny } from "../../../../casl/ability";
import { useAbility } from "../../../../casl/AbilityContext";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import FieldNumberInput from "../../../../components/FieldNumberInput/FieldNumberInput";
import LabelInput from "../../../../components/labelInput/LabelInput";
import FieldTextareaInput from "../../../../components/textAreaInput/FieldTextareaInput";
import { UPDATE_COMPANY } from "../../../../graphql/mutations/Company";
import { CREATE_SALE_PAYMENT } from "../../../../graphql/mutations/SalePayment";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { LIST_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IDetailSalePayment, ISalePaymentInput } from "../../../../utils/interfaces/SalePayment";
import { getSalePaymentMethodOptions } from "../../utils/salePaymentMethodMock";
import useQrPaymentAvailable from "../../../../hooks/useQrPaymentAvailable";
import { schemaFormSalePayment } from "../../validations/FormSalePaymentValidation";
import {
  DETAIL_SALE_PAYMENT_BY_SALE_ORDER,
  LIST_SALE_PAYMENT_BY_SALE_ORDER,
} from "../../../../graphql/queries/SalePayment";
import useAuth from "../../../auth/hooks/useAuth";
import { convertCurrency, formatAmount, round2 } from "../../../../utils/currency";
import { showToast } from "../../../../utils/toastUtils";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";

interface SalePaymentFormProps {
  setVisibleSalePaymentForm: (isVisible: boolean) => void;
  saleOrderId: string;
  detailSalePayment: IDetailSalePayment;
  onRequestQr: (amount: number) => void;
}

const SalePaymentForm: FC<SalePaymentFormProps> = ({
  setVisibleSalePaymentForm,
  saleOrderId,
  detailSalePayment,
  onRequestQr,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Efectivo");
  const { currency } = useAuth();
  const qrAvailable = useQrPaymentAvailable();
  const ability = useAbility();
  const canEditCompany = canDoAny(ability, ["UPDATE_COMPANY"]);

  const { data: companyData, refetch: refetchCompany } = useQuery(DETAIL_COMPANY);
  const company = companyData?.detailCompany;

  const saldoPendiente = round2(detailSalePayment?.total_pending ?? 0);
  const isQr = selectedPaymentMethod === "QR";
  // Moneda de la venta (a la que se descuenta el saldo) — puede diferir de
  // la moneda base de la empresa si la venta se creó en la alterna.
  const orderCurrency = detailSalePayment?.sale_order?.currency ?? currency;

  // El picker de moneda del pago no aplica a QR (ya tiene su propia
  // conversión a Bs, independiente de esto) ni a empresas en Bs.
  const showCurrencyPicker = company?.currency === "$" && !isQr;
  const [selectedPaymentCurrency, setSelectedPaymentCurrency] = useState<string>("$");
  const [rateInput, setRateInput] = useState<number | null>(null);
  const [updateCompany, { loading: savingRate }] = useMutation(UPDATE_COMPANY);

  // Solo un pago en Bs necesita tipo de cambio configurado — uno en $ no.
  const needsExchangeRate = showCurrencyPicker && selectedPaymentCurrency === "Bs" && !company?.exchange_rate;

  const handleSaveExchangeRate = async () => {
    if (!rateInput || rateInput <= 0) return;
    try {
      await updateCompany({ variables: { input: { exchange_rate: rateInput } } });
      await refetchCompany();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const [createSalePayment] = useMutation(CREATE_SALE_PAYMENT, {
    refetchQueries: [
      { query: LIST_SALE_ORDER },
      {
        query: LIST_SALE_PAYMENT_BY_SALE_ORDER,
        variables: { saleOrderId },
      },
      {
        query: DETAIL_SALE_PAYMENT_BY_SALE_ORDER,
        variables: { saleOrderId },
      },
    ],
  });

  const initialValues: ISalePaymentInput = {
    sale_order: saleOrderId,
    date: new Date(),
    amount: 0,
    payment_method: "Efectivo",
    note: "",
  };

  const handlePaymentMethodChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedPaymentMethod(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const handleAmountChange = async (e: InputNumberChangeEvent) => {
    setFieldValue("amount", e.value || 0);
  };

  const onSubmit = async () => {
    await createSalePayment({
      variables: {
        ...values,
        currency: showCurrencyPicker && selectedPaymentCurrency === "Bs" ? "Bs" : undefined,
      },
    });

    setVisibleSalePaymentForm(false);
    setSelectedPaymentCurrency("$");
    resetForm();
  };

  const {
    handleChange,
    handleSubmit,
    resetForm,
    values,
    errors,
    dirty,
    isValid,
    isSubmitting,
    setFieldValue,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Pago creado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormSalePayment,
  });

  // El monto se ingresa en la moneda elegida para este pago (o en la moneda
  // de la empresa si no aplica el picker) — hay que convertirlo a la moneda
  // de la venta antes de compararlo contra el saldo pendiente.
  const effectiveEnteredCurrency = showCurrencyPicker ? selectedPaymentCurrency : (company?.currency ?? currency);
  const amountInOrderCurrency = convertCurrency(
    values.amount || 0,
    effectiveEnteredCurrency,
    orderCurrency,
    company?.exchange_rate
  );
  const amountExceedsSaldo = round2(amountInOrderCurrency) > saldoPendiente;
  const nuevoSaldo = round2(saldoPendiente - amountInOrderCurrency);

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid grid-cols-1 md:grid-cols-2 w-full md:w-[600px] gap-4">
        <div>
          <LabelInput name="date" label="Fecha de pago" />
          <Calendar
            name="date"
            value={values.date}
            onChange={handleChange}
            showIcon
            className="w-full"
          />
        </div>

        <DropdownInput
          label="Metodo de pago"
          name="payment_method"
          optionLabel="label"
          placeholder="Seleccionar metodo de pago"
          mandatory
          options={getSalePaymentMethodOptions(qrAvailable)}
          optionDisabled="disabled"
          value={selectedPaymentMethod}
          error={errors.payment_method ? errors.payment_method : ""}
          onChange={handlePaymentMethodChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {showCurrencyPicker && (
            <div>
              <LabelInput name="payment_currency" label="Moneda del pago" />
              <SelectButton
                value={selectedPaymentCurrency}
                options={[
                  { label: "$", value: "$" },
                  { label: "Bs", value: "Bs" },
                ]}
                onChange={(e) => e.value && setSelectedPaymentCurrency(e.value)}
                className="w-full"
              />
              {needsExchangeRate && (
                <div className="flex flex-col gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-1">
                  <p className="text-xs text-amber-700">
                    No tienes un tipo de cambio configurado. No se puede registrar el pago en Bs sin eso.
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
            </div>
          )}

          <div className="flex flex-col gap-5">
            <FieldNumberInput
              label={`Monto (${effectiveEnteredCurrency})`}
              name="amount"
              mandatory
              placeholder="Monto de pago"
              value={values.amount}
              error={errors.amount ? errors.amount : ""}
              onChange={handleAmountChange}
            />
            <div className="flex flex-col text-xs gap-0.5">
              <span className="text-gray-400">
                Saldo pendiente: {formatAmount(saldoPendiente)} {orderCurrency}
              </span>
              {amountExceedsSaldo ? (
                <span className="text-red-500">
                  El monto no puede ser mayor al saldo pendiente ({formatAmount(saldoPendiente)} {orderCurrency})
                </span>
              ) : (
                <span className="text-gray-500">
                  Nuevo saldo:{" "}
                  <span className="font-semibold">{formatAmount(nuevoSaldo)} {orderCurrency}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <FieldTextareaInput
          className="md:col-span-2"
          role="input-note"
          label="Nota de pago"
          name="note"
          value={values.note}
          rows={5}
          cols={30}
          error={errors.note ? errors.note : ""}
          onChange={handleChange}
        />
      </section>

      <section className="flex justify-center">
        {isQr ? (
          <Button
            type="button"
            severity="info"
            icon="pi pi-qrcode"
            label="Generar QR"
            className="w-full md:w-auto"
            disabled={!qrAvailable || !values.amount || values.amount <= 0 || amountExceedsSaldo}
            onClick={() => onRequestQr(values.amount || 0)}
          />
        ) : (
          <Button
            type="submit"
            severity="success"
            label="Guardar"
            className="w-full md:w-auto"
            disabled={!dirty || !isValid || isSubmitting || amountExceedsSaldo || needsExchangeRate}
          />
        )}
      </section>
    </form>
  );
};

export default SalePaymentForm;
