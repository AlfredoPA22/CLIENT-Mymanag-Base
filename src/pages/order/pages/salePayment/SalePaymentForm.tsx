import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";

import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Calendar } from "primereact/calendar";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { FC, useState } from "react";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import FieldNumberInput from "../../../../components/FieldNumberInput/FieldNumberInput";
import LabelInput from "../../../../components/labelInput/LabelInput";
import FieldTextareaInput from "../../../../components/textAreaInput/FieldTextareaInput";
import { CREATE_SALE_PAYMENT } from "../../../../graphql/mutations/SalePayment";
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
import { formatAmount, round2 } from "../../../../utils/currency";

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

  const saldoPendiente = round2(detailSalePayment?.total_pending ?? 0);
  const isQr = selectedPaymentMethod === "QR";

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
    await createSalePayment({ variables: values });

    setVisibleSalePaymentForm(false);
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

  const amountExceedsSaldo = round2(values.amount || 0) > saldoPendiente;
  const nuevoSaldo = round2(saldoPendiente - (values.amount || 0));

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid grid-cols-1 md:grid-cols-3 w-full md:w-[600px] gap-4">
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

        <div className="flex flex-col gap-1">
          <FieldNumberInput
            label="Monto"
            name="amount"
            mandatory
            placeholder="Monto de pago"
            value={values.amount}
            error={errors.amount ? errors.amount : ""}
            onChange={handleAmountChange}
          />
          <div className="flex flex-col text-xs gap-0.5">
            <span className="text-gray-400">
              Saldo pendiente: {formatAmount(saldoPendiente)} {currency}
            </span>
            {amountExceedsSaldo ? (
              <span className="text-red-500">
                El monto no puede ser mayor al saldo pendiente ({formatAmount(saldoPendiente)} {currency})
              </span>
            ) : (
              <span className="text-gray-500">
                Nuevo saldo:{" "}
                <span className="font-semibold">{formatAmount(nuevoSaldo)} {currency}</span>
              </span>
            )}
          </div>
        </div>

        <FieldTextareaInput
          className="md:col-span-3"
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
            disabled={!dirty || !isValid || isSubmitting || amountExceedsSaldo}
          />
        )}
      </section>
    </form>
  );
};

export default SalePaymentForm;
