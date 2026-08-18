import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC, useRef } from "react";
import BarcodeScannerButton from "../../components/barcodeScanner/BarcodeScannerButton";
import LabelInput from "../../components/labelInput/LabelInput";
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
      className="flex flex-col md:flex-row gap-3 items-start mb-4"
    >
      <div className="flex-1 flex items-start gap-2">
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
        {/* Misma estructura invisible que FieldTextInput (label + hueco de
            error) para que el botón quede a la altura del input. Se reusa
            LabelInput con las mismas props en vez de un texto a mano, para
            que la altura calce exacto con la del input real. */}
        <div className="flex flex-col p-inputtext-sm">
          <LabelInput label="Serial" mandatory className="invisible" />
          <BarcodeScannerButton onScan={(value) => setFieldValue("serial", value)} />
          <span className="text-xs block h-5" />
        </div>
      </div>
      {/* Mismo espaciador invisible que los dos de arriba — sin esto, el
          botón (sin label ni hueco de error propios) quedaba más abajo que
          el input al alinear la fila entera contra el borde inferior. */}
      <div className="flex flex-col p-inputtext-sm w-full md:w-auto">
        <LabelInput label="Serial" mandatory className="invisible" />
        <Button
          className="h-[50px] w-full md:w-auto"
          type="submit"
          severity="success"
          label="Guardar serial"
          disabled={!dirty || !isValid || isSubmitting}
        />
        <span className="text-xs block h-5" />
      </div>
    </form>
  );
};

export default AddSerialToTransferDetailForm;
