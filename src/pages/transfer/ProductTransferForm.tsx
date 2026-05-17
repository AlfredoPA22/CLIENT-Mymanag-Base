import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ActionMeta, SingleValue } from "react-select";
import LabelInput from "../../components/labelInput/LabelInput";
import SelectInput from "../../components/SelectInput/SelectInput";
import {
  APPROVE_PRODUCT_TRANSFER,
  CREATE_PRODUCT_TRANSFER,
} from "../../graphql/mutations/ProductTransfer";
import { CREATE_WAREHOUSE } from "../../graphql/mutations/Warehouse";
import { LIST_PRODUCT_TRANSFER } from "../../graphql/queries/ProductTransfer";
import { LIST_WAREHOUSE } from "../../graphql/queries/Warehouse";
import { useFormikForm } from "../../hooks/useFormikForm";
import {
  resetProductTransfer,
  setProductTransfer,
  setProductTransferInitialized,
} from "../../redux/slices/productTransferSlice";
import { setIsBlocked } from "../../redux/slices/blockUISlice";
import { RootState } from "../../redux/store";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { IProductTransferInput } from "../../utils/interfaces/ProductTransfer";
import { IReactSelect } from "../../utils/interfaces/Select";
import { showToast } from "../../utils/toastUtils";
import useWarehouseList from "../product/hooks/useWarehouseList";
import { getStatus } from "../order/utils/getStatus";
import { schemaFormProductTransfer } from "./validations/FormProductTransferValidation";

interface ProductTransferFormProps {
  approveBlocked?: boolean;
}

const ProductTransferForm: FC<ProductTransferFormProps> = ({
  approveBlocked = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { listWarehouseSelect } = useWarehouseList();

  const { productTransferInitialized, productTransferData } = useSelector(
    (state: RootState) => state.productTransferSlice
  );

  const [selectedOrigin, setSelectedOrigin] = useState<IReactSelect | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<IReactSelect | null>(null);

  const [createProductTransfer] = useMutation(CREATE_PRODUCT_TRANSFER, {
    refetchQueries: [{ query: LIST_PRODUCT_TRANSFER }],
  });

  const [approveProductTransfer] = useMutation(APPROVE_PRODUCT_TRANSFER, {
    refetchQueries: [{ query: LIST_PRODUCT_TRANSFER }],
  });

  const [createWarehouse] = useMutation(CREATE_WAREHOUSE, {
    refetchQueries: [{ query: LIST_WAREHOUSE }],
  });

  const initialValues: IProductTransferInput = {
    date: new Date(),
    origin_warehouse: "",
    destination_warehouse: "",
  };

  const onSubmit = async () => {
    const { data } = await createProductTransfer({
      variables: {
        date: values.date.toString(),
        origin_warehouse: values.origin_warehouse,
        destination_warehouse: values.destination_warehouse,
      },
    });
    dispatch(setProductTransfer(data.createProductTransfer));
    dispatch(setProductTransferInitialized(true));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(resetProductTransfer());
    setSelectedOrigin(null);
    setSelectedDestination(null);
    resetForm();
  };

  const handleApprove = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await approveProductTransfer({
        variables: { transferId: productTransferData?._id },
      });
      if (data) {
        showToast({ detail: "Transferencia aprobada exitosamente", severity: ToastSeverity.Success });
        navigate(`${ROUTES_MOCK.TRANSFERS}/detalle/${data.approveProductTransfer._id}`);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const onCreateOriginWarehouse = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createWarehouse({ variables: { name: inputValue, description: "" } });
      if (data) {
        showToast({ detail: "Almacén creado", severity: ToastSeverity.Success });
        const newOption = { value: data.createWarehouse._id, label: data.createWarehouse.name };
        setSelectedOrigin(newOption);
        setFieldValue("origin_warehouse", data.createWarehouse._id);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const onCreateDestinationWarehouse = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createWarehouse({ variables: { name: inputValue, description: "" } });
      if (data) {
        showToast({ detail: "Almacén creado", severity: ToastSeverity.Success });
        const newOption = { value: data.createWarehouse._id, label: data.createWarehouse.name };
        setSelectedDestination(newOption);
        setFieldValue("destination_warehouse", data.createWarehouse._id);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleOriginChange = async (event: SingleValue<IReactSelect>, action: ActionMeta<IReactSelect>) => {
    setSelectedOrigin(event);
    setFieldValue(action.name || "", event ? event.value : "");
  };

  const handleDestinationChange = async (event: SingleValue<IReactSelect>, action: ActionMeta<IReactSelect>) => {
    setSelectedDestination(event);
    setFieldValue(action.name || "", event ? event.value : "");
  };

  const {
    handleChange,
    handleSubmit,
    values,
    errors,
    isValid,
    isSubmitting,
    setFieldValue,
    resetForm,
  } = useFormikForm<IProductTransferInput>({
    initialValues,
    msgSuccess: "Transferencia creada",
    handleSubmit: onSubmit,
    validationSchema: schemaFormProductTransfer,
  });

  const transferStatus = productTransferData?.status
    ? getStatus(productTransferData.status)
    : null;

  return (
    <form
      id="transfer-form"
      onSubmit={handleSubmit}
      className="p-4 md:p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2"
    >
      <div className="flex flex-col items-center text-center gap-1 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Nueva Transferencia</h2>
        <p className="text-gray-500 text-sm">Completa los detalles para registrar la transferencia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
        {/* Campos del formulario */}
        <section className="flex flex-col gap-3 md:border-r md:border-r-gray-300 md:pr-6">
          <div className="flex flex-col">
            <LabelInput name="date" label="Fecha" />
            <Calendar
              name="date"
              value={values.date}
              onChange={handleChange}
              showIcon
              disabled={productTransferInitialized}
              className="w-full"
            />
          </div>
          <SelectInput
            label="Almacén origen"
            name="origin_warehouse"
            placeholder="Seleccionar origen"
            mandatory
            options={listWarehouseSelect}
            value={selectedOrigin}
            error={errors.origin_warehouse}
            onChange={handleOriginChange}
            onCreateOption={onCreateOriginWarehouse}
            disabled={productTransferInitialized}
          />
          <SelectInput
            label="Almacén destino"
            name="destination_warehouse"
            placeholder="Seleccionar destino"
            mandatory
            options={listWarehouseSelect.filter((w) => w.value !== values.origin_warehouse)}
            value={selectedDestination}
            error={errors.destination_warehouse}
            onChange={handleDestinationChange}
            onCreateOption={onCreateDestinationWarehouse}
            disabled={productTransferInitialized}
          />
        </section>

        {/* Centro: botón crear o resumen de ruta */}
        <div className="flex justify-center">
          {!productTransferInitialized ? (
            <Button
              icon="pi pi-plus"
              type="submit"
              severity="success"
              label="Crear transferencia"
              className="w-full md:w-auto"
              disabled={!isValid || isSubmitting}
            />
          ) : (
            <section className="flex flex-col items-center justify-center gap-1 text-center">
              <span className="text-gray-500 text-sm">Almacén origen</span>
              <span className="font-semibold break-words">
                {productTransferData?.origin_warehouse?.name}
              </span>
              <span className="text-gray-400 text-xs mt-1">→</span>
              <span className="text-gray-500 text-sm">Almacén destino</span>
              <span className="font-semibold break-words">
                {productTransferData?.destination_warehouse?.name}
              </span>
            </section>
          )}
        </div>

        {/* Código + estado + acciones (solo cuando hay transferencia creada) */}
        {productTransferInitialized && (
          <section className="flex flex-col gap-4 rounded-md">
            <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
              <span className="text-gray-600 text-sm">Código</span>
              <span className="text-xl font-bold text-gray-800">{productTransferData?.code}</span>
              {transferStatus && (
                <Tag
                  severity={transferStatus.severity as "danger" | "success" | "info" | "warning"}
                >
                  {transferStatus.label}
                </Tag>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                severity="warning"
                label="Reiniciar"
                onClick={handleReset}
                className="w-full"
              />
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar"
                onClick={handleApprove}
                disabled={approveBlocked}
                className="w-full"
              />
            </div>
          </section>
        )}
      </div>
    </form>
  );
};

export default ProductTransferForm;
