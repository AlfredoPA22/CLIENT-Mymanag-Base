import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC, useRef, useState } from "react";
import BarcodeScannerButton from "../../../../components/barcodeScanner/BarcodeScannerButton";
import LabelInput from "../../../../components/labelInput/LabelInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { ADD_SERIAL_TO_PURCHASE_ORDER_DETAIL } from "../../../../graphql/mutations/PurchaseOrderDetail";
import {
  LIST_PURCHASE_ORDER_DETAIL,
  LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL,
} from "../../../../graphql/queries/PurchaseOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IAddSerialToPurchaseOrderDetailInput } from "../../../../utils/interfaces/PurchaseOrderDetail";
import { schemaFormAddSerialToPurchaseOrderDetail } from "../../validations/FormAddSerialToPurchaseOrderDetailValidation";
import CreatableAutoComplete from "../../../../components/creatableAutoComplete/CreatableAutoComplete";
import useWarehouseList from "../../../product/hooks/useWarehouseList";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { CREATE_WAREHOUSE } from "../../../../graphql/mutations/Warehouse";
import { showToast } from "../../../../utils/toastUtils";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";

interface AddSerialToDetailFormProps {
  purchaseOrderId: string;
  purchaseOrderDetailId: string;
}

const AddSerialToDetailForm: FC<AddSerialToDetailFormProps> = ({
  purchaseOrderId,
  purchaseOrderDetailId,
}) => {
  const { listWarehouseSelect, refetchListWarehouse } = useWarehouseList();

  const dispatch = useDispatch();

  const serialInputRef = useRef<HTMLInputElement>(null);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState<IReactSelect | null>(null);

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
  // Sin refetchQueries acá — mismo motivo que en PurchaseOrderDetailForm.tsx:
  // refresca cualquier observer de LIST_WAREHOUSE en toda la app, y si queda
  // en vuelo justo al cerrar/reabrir este formulario deja el select vacío.
  const [createWarehouse] = useMutation(CREATE_WAREHOUSE);

  const initialValues: IAddSerialToPurchaseOrderDetailInput = {
    serial: "",
    warehouse: "",
    purchase_order_detail: purchaseOrderDetailId,
  };

  const onSubmit = async () => {
    await addSerialToPurchaseOrderDetail({ variables: values });
    setFieldValue("serial", "");
    serialInputRef.current?.focus();
  };

  const handleWarehouseChange = (value: IReactSelect | null) => {
    setSelectedWarehouse(value);
    setFieldValue("warehouse", value ? value.value : "");
  };

  const onCreateWarehouse = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createWarehouse({
        variables: {
          name: inputValue,
          description: "",
        },
      });

      if (data) {
        showToast({
          detail: "Almacén creado",
          severity: ToastSeverity.Success,
        });

        setSelectedWarehouse({
          value: data.createWarehouse._id,
          label: data.createWarehouse.name,
        });

        setFieldValue("warehouse", data.createWarehouse._id);
        await refetchListWarehouse();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
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
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Serial Agregado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormAddSerialToPurchaseOrderDetail,
  });
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:grid md:grid-cols-5 gap-2 mb-2"
    >
      <div className="col-span-2">
        <CreatableAutoComplete
          label="Almacén"
          name="warehouse"
          placeholder="Seleccionar o escribir almacén"
          mandatory
          options={listWarehouseSelect}
          error={errors.warehouse ? errors.warehouse : ""}
          onChange={handleWarehouseChange}
          onCreateOption={onCreateWarehouse}
          value={selectedWarehouse}
        />
      </div>
      <div className="col-span-2 flex items-start gap-2">
        <div className="flex-1">
          <FieldTextInput
            label="Serial"
            type="text"
            name="serial"
            mandatory
            placeholder="Ingresa el serial"
            inputRef={serialInputRef}
            value={values.serial}
            error={errors.serial ? errors.serial : ""}
            onChange={handleChange}
          />
        </div>
        {/* Misma estructura invisible que FieldTextInput (label + hueco de
            error) para que el botón quede a la altura del input, no
            centrado/pegado contra toda la columna (que es más alta por la
            label y la línea de error). Se reusa LabelInput con las mismas
            props (label + mandatory) en vez de un texto a mano, para que la
            altura calce exacto con la del input real. */}
        <div className="flex flex-col p-inputtext-sm">
          <LabelInput label="Serial" mandatory className="invisible" />
          <BarcodeScannerButton onScan={(value) => setFieldValue("serial", value)} />
          <span className="text-xs block h-5" />
        </div>
      </div>

      <section className="flex justify-center items-center w-full md:w-auto">
        <Button
          className="h-[50px] w-full md:w-auto"
          type="submit"
          severity="success"
          label="Guardar serial"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default AddSerialToDetailForm;
