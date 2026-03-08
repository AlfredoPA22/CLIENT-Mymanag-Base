import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC, useRef } from "react";
import FieldTextInput from "../../components/textInput/FieldTextInput";
import { ADD_SERIAL_TO_TRANSFER_DETAIL } from "../../graphql/mutations/ProductTransfer";
import { LIST_PRODUCT_TRANSFER_DETAIL } from "../../graphql/queries/ProductTransfer";
import { useFormikForm } from "../../hooks/useFormikForm";
import { IAddSerialToTransferDetailInput } from "../../utils/interfaces/ProductTransfer";
import { schemaFormAddSerialToTransferDetail } from "./validations/FormAddSerialToTransferDetailValidation";

interface AddSerialToTransferDetailFormProps {
  transferId: string;
  transferDetailId: string;
}

const AddSerialToTransferDetailForm: FC<AddSerialToTransferDetailFormProps> = ({
  transferId,
  transferDetailId,
}) => {
  const serialInputRef = useRef<HTMLInputElement>(null);

  const [addSerial] = useMutation(ADD_SERIAL_TO_TRANSFER_DETAIL, {
    refetchQueries: [
      {
        query: LIST_PRODUCT_TRANSFER_DETAIL,
        variables: { transferId },
      },
    ],
  });

  const initialValues: IAddSerialToTransferDetailInput = {
    product_transfer_detail: transferDetailId,
    serial: "",
  };

  const onSubmit = async () => {
    await addSerial({ variables: values });
    setFieldValue("serial", "");
    serialInputRef.current?.focus();
  };

  const {
    handleChange,
    handleSubmit,
    values,
    errors,
    dirty,
    isValid,
    isSubmitting,
    setFieldValue,
  } = useFormikForm<IAddSerialToTransferDetailInput>({
    initialValues,
    msgSuccess: "Serial agregado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormAddSerialToTransferDetail,
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-3 items-end mb-4"
    >
      <div className="flex-1">
        <FieldTextInput
          label="Serial"
          type="text"
          name="serial"
          mandatory
          placeholder="Ingresá el serial"
          inputRef={serialInputRef}
          value={values.serial}
          error={errors.serial}
          onChange={handleChange}
        />
      </div>
      <Button
        type="submit"
        severity="success"
        label="Agregar"
        icon="pi pi-plus"
        disabled={!dirty || !isValid || isSubmitting}
      />
    </form>
  );
};

export default AddSerialToTransferDetailForm;
