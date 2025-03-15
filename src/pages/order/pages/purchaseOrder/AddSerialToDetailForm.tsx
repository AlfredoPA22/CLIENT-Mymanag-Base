import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { ADD_SERIAL_TO_PURCHASE_ORDER_DETAIL } from "../../../../graphql/mutations/PurchaseOrderDetail";
import {
  LIST_PURCHASE_ORDER_DETAIL,
  LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL,
} from "../../../../graphql/queries/PurchaseOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IAddSerialToPurchaseOrderDetailInput } from "../../../../utils/interfaces/PurchaseOrderDetail";
import { schemaFormAddSerialToPurchaseOrderDetail } from "../../validations/FormAddSerialToPurchaseOrderDetailValidation";

interface AddSerialToDetailFormProps {
  purchaseOrderId: string;
  purchaseOrderDetailId: string;
}

const AddSerialToDetailForm: FC<AddSerialToDetailFormProps> = ({
  purchaseOrderId,
  purchaseOrderDetailId,
}) => {
  const [addSerialToPurchaseOrderDetail] = useMutation(
    ADD_SERIAL_TO_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderId,
          },
        },
        {
          query: LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderDetailId,
          },
        },
      ],
    }
  );
  const initialValues: IAddSerialToPurchaseOrderDetailInput = {
    serial: "",
    purchase_order_detail: purchaseOrderDetailId,
  };

  const onSubmit = async () => {
    await addSerialToPurchaseOrderDetail({ variables: values });
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
    validationSchema: schemaFormAddSerialToPurchaseOrderDetail,
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
