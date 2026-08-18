import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CreatableAutoComplete from "../../components/creatableAutoComplete/CreatableAutoComplete";
import LabelInput from "../../components/labelInput/LabelInput";
import {
  APPROVE_PRODUCT_TRANSFER,
  CREATE_PRODUCT_TRANSFER,
} from "../../graphql/mutations/ProductTransfer";
import { CREATE_WAREHOUSE } from "../../graphql/mutations/Warehouse";
import { DETAIL_COMPANY } from "../../graphql/queries/Company";
import {
  FIND_PRODUCT_TRANSFER,
  LIST_PRODUCT_TRANSFER,
  LIST_PRODUCT_TRANSFER_DETAIL,
} from "../../graphql/queries/ProductTransfer";
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
import { generateProductTransferPDF } from "./utils/generateProductTransferPDF";
import { schemaFormProductTransfer } from "./validations/FormProductTransferValidation";

interface ProductTransferFormProps {
  approveBlocked?: boolean;
}

const ProductTransferForm: FC<ProductTransferFormProps> = ({
  approveBlocked = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { listWarehouseSelect, refetchListWarehouse } = useWarehouseList();

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

  // Sin refetchQueries acá — mismo bug de select vacío ya encontrado en
  // ProductForm.tsx/PurchaseOrderDetailForm.tsx. Se llama a
  // refetchListWarehouse directamente en cada onCreate*Warehouse.
  const [createWarehouse] = useMutation(CREATE_WAREHOUSE);

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

  const handleGeneratePDF = async () => {
    if (!productTransferData?._id) return;
    try {
      dispatch(setIsBlocked(true));
      const { data } = await client.query({
        query: FIND_PRODUCT_TRANSFER,
        variables: { transferId: productTransferData._id },
        fetchPolicy: "network-only",
      });
      const { data: detailData } = await client.query({
        query: LIST_PRODUCT_TRANSFER_DETAIL,
        variables: { transferId: productTransferData._id },
        fetchPolicy: "network-only",
      });
      const { data: dataCompany } = await client.query({
        query: DETAIL_COMPANY,
        fetchPolicy: "network-only",
      });
      await generateProductTransferPDF(
        data.findProductTransfer,
        detailData.listProductTransferDetail,
        dataCompany.detailCompany
      );
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
        await refetchListWarehouse();
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
        await refetchListWarehouse();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleOriginChange = (value: IReactSelect | null) => {
    setSelectedOrigin(value);
    setFieldValue("origin_warehouse", value ? value.value : "");
  };

  const handleDestinationChange = (value: IReactSelect | null) => {
    setSelectedDestination(value);
    setFieldValue("destination_warehouse", value ? value.value : "");
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-center">
        {/* Campos del formulario */}
        <section className="flex flex-col gap-3 lg:border-r lg:border-r-gray-300 lg:pr-6">
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
          <CreatableAutoComplete
            label="Almacén origen"
            name="origin_warehouse"
            placeholder="Seleccionar o escribir origen"
            mandatory
            options={listWarehouseSelect}
            value={selectedOrigin}
            error={errors.origin_warehouse}
            onChange={handleOriginChange}
            onCreateOption={onCreateOriginWarehouse}
            disabled={productTransferInitialized}
          />
          <CreatableAutoComplete
            label="Almacén destino"
            name="destination_warehouse"
            placeholder="Seleccionar o escribir destino"
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
              className="w-full lg:w-auto"
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
              <Button
                icon="pi pi-download"
                type="button"
                severity="secondary"
                label="Imprimir"
                onClick={handleGeneratePDF}
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
