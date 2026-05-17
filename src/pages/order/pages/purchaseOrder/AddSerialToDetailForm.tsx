import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { FC, useRef, useState } from "react";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { ADD_SERIAL_TO_PURCHASE_ORDER_DETAIL } from "../../../../graphql/mutations/PurchaseOrderDetail";
import {
  LIST_PURCHASE_ORDER_DETAIL,
  LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL,
} from "../../../../graphql/queries/PurchaseOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IAddSerialToPurchaseOrderDetailInput } from "../../../../utils/interfaces/PurchaseOrderDetail";
import { schemaFormAddSerialToPurchaseOrderDetail } from "../../validations/FormAddSerialToPurchaseOrderDetailValidation";
import SelectInput from "../../../../components/SelectInput/SelectInput";
import useWarehouseList from "../../../product/hooks/useWarehouseList";
import { ActionMeta, SingleValue } from "react-select";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { CREATE_WAREHOUSE } from "../../../../graphql/mutations/Warehouse";
import { LIST_WAREHOUSE } from "../../../../graphql/queries/Warehouse";
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
  const { listWarehouseSelect } = useWarehouseList();

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
  const [createWarehouse] = useMutation(CREATE_WAREHOUSE, {
    refetchQueries: [{ query: LIST_WAREHOUSE }],
  });

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

  const handleWarehouseChange = async (
    event: SingleValue<IReactSelect>,
    action: ActionMeta<IReactSelect>
  ) => {
    setSelectedWarehouse(event);
    setFieldValue(action.name || "", event ? event.value : "");
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
        <SelectInput
          label="Almacén"
          name="warehouse"
          placeholder="Seleccionar almacén"
          mandatory
          options={listWarehouseSelect}
          error={errors.warehouse ? errors.warehouse : ""}
          onChange={handleWarehouseChange}
          onCreateOption={onCreateWarehouse}
          value={selectedWarehouse}
        />
      </div>
      <div className="col-span-2">
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
