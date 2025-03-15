import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { ADD_SERIAL_TO_SALE_ORDER_DETAIL } from "../../../../graphql/mutations/SaleOrderDetail";
import { LIST_SALE_ORDER_DETAIL, LIST_SERIAL_BY_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IAddSerialToSaleOrderDetailInput } from "../../../../utils/interfaces/SaleOrderDetail";
import { schemaFormAddSerialToSaleOrderDetail } from "../../validations/FormAddSerialToSaleOrderDetailValidation";

interface AddSerialToDetailFormProps {
  saleOrderId: string;
  saleOrderDetailId: string;
}

const AddSerialToDetailForm: FC<AddSerialToDetailFormProps> = ({
  saleOrderId,
  saleOrderDetailId,
}) => {
  const [addSerialToSaleOrderDetail] = useMutation(
    ADD_SERIAL_TO_SALE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_SALE_ORDER_DETAIL,
          variables: {
            saleOrderId,
          },
        },
        {
          query: LIST_SERIAL_BY_SALE_ORDER_DETAIL,
          variables: {
            saleOrderDetailId,
          },
        },
      ],
    }
  );
  const initialValues: IAddSerialToSaleOrderDetailInput = {
    serial: "",
    sale_order_detail: saleOrderDetailId,
  };

  const onSubmit = async () => {
    await addSerialToSaleOrderDetail({ variables: values });
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
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Serial Agregado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormAddSerialToSaleOrderDetail,
  });
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 justify-center"
    >
      <section className="grid justify-center items-start gap-2">
        <FieldTextInput
          className="flex justify-center items-center"
          label=""
          type="text"
          name="serial"
          placeholder="Ingresa el codigo del serial"
          value={values.serial}
          error={errors.serial ? errors.serial : ""}
          onChange={handleChange}
        />
      </section>

      <section className="flex justify-center items-start">
        <Button
          className="h-[50px]"
          type="submit"
          severity="success"
          label="Guardar"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default AddSerialToDetailForm;
