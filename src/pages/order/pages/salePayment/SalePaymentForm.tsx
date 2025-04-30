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
import { ISalePaymentInput } from "../../../../utils/interfaces/SalePayment";
import { salePaymentMethodOptions } from "../../utils/salePaymentMethodMock";
import { schemaFormSalePayment } from "../../validations/FormSalePaymentValidation";
import {
  DETAIL_SALE_PAYMENT_BY_SALE_ORDER,
  LIST_SALE_PAYMENT_BY_SALE_ORDER,
} from "../../../../graphql/queries/SalePayment";

interface SalePaymentFormProps {
  setVisibleSalePaymentForm: (isVisible: boolean) => void;
  saleOrderId: string;
}

const SalePaymentForm: FC<SalePaymentFormProps> = ({
  setVisibleSalePaymentForm,
  saleOrderId,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Efectivo");

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

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid  grid-cols-3 w-[300px] md:w-[600px] gap-4">
        <div>
          <LabelInput name="date" label="Fecha de pago" />
          <Calendar
            name="date"
            value={values.date}
            onChange={handleChange}
            showIcon
          />
        </div>

        <DropdownInput
          label="Metodo de pago"
          name="payment_method"
          optionLabel="label"
          placeholder="Seleccionar metodo de pago"
          mandatory
          options={salePaymentMethodOptions}
          value={selectedPaymentMethod}
          error={errors.payment_method ? errors.payment_method : ""}
          onChange={handlePaymentMethodChange}
        />

        <FieldNumberInput
          label="Monto"
          name="amount"
          mandatory
          placeholder="Monto de pago"
          value={values.amount}
          error={errors.amount ? errors.amount : ""}
          onChange={handleAmountChange}
        />

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
        <Button
          type="submit"
          severity="success"
          label="Guardar"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default SalePaymentForm;
