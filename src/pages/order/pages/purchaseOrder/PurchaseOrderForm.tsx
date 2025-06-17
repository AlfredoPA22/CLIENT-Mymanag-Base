import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ActionMeta, SingleValue } from "react-select";
import LabelInput from "../../../../components/labelInput/LabelInput";
import SelectInput from "../../../../components/SelectInput/SelectInput";
import { CREATE_PROVIDER } from "../../../../graphql/mutations/Provider";
import {
  APPROVE_PURCHASE_ORDER,
  CREATE_PURCHASE_ORDER,
} from "../../../../graphql/mutations/PurchaseOrder";
import { GENERATE_CODE } from "../../../../graphql/queries/CodeGenerator";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import { LIST_PROVIDER } from "../../../../graphql/queries/Provider";
import { LIST_PURCHASE_ORDER } from "../../../../graphql/queries/PurchaseOrder";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import {
  resetPurchaseOrder,
  setPurchaseOrder,
  setPurchaseOrderInitialized,
} from "../../../../redux/slices/purchaseOrderSlice";
import { RootState } from "../../../../redux/store";
import { codeType } from "../../../../utils/enums/codeType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IPurchaseOrderInput } from "../../../../utils/interfaces/PurchaseOrder";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { showToast } from "../../../../utils/toastUtils";
import useProviderList from "../../../provider/hooks/useProviderList";
import { getStatus } from "../../utils/getStatus";
import { schemaFormPurchaseOrder } from "../../validations/FormPurchaseOrderValidation";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import useAuth from "../../../auth/hooks/useAuth";

const PurchaseOrderForm = () => {
  const {
    data: { generateCode: codeOrder } = "",
    error: errorCodeOrder,
    refetch: refetchCodeOrder,
  } = useQuery(GENERATE_CODE, {
    variables: { type: codeType.PURCHASE_ORDER },
    fetchPolicy: "network-only",
  });

  const { listProviderSelect } = useProviderList();
  const { currency } = useAuth();

  const [selectedProvider, setSelectedProvider] = useState<IReactSelect | null>(
    null
  );

  const navigate = useNavigate();

  const [createPurchaseOrder] = useMutation(CREATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: LIST_PURCHASE_ORDER }],
  });

  const [approvePurchaseOrder] = useMutation(APPROVE_PURCHASE_ORDER, {
    refetchQueries: [{ query: LIST_PURCHASE_ORDER }, { query: LIST_PRODUCT }],
  });

  const [createProvider] = useMutation(CREATE_PROVIDER, {
    refetchQueries: [{ query: LIST_PROVIDER }],
  });

  const { purchaseOrderInitialized, purchaseOrderData } = useSelector(
    (state: RootState) => state.purchaseOrderSlice
  );

  const dispatch = useDispatch();

  const initialValues: IPurchaseOrderInput = {
    date: new Date(),
    provider: "",
  };

  useEffect(() => {
    if (errorCodeOrder) {
      showToast({
        detail: errorCodeOrder.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [errorCodeOrder]);

  const onSubmit = async () => {
    const order: IPurchaseOrderInput = {
      date: values.date,
      provider: values.provider,
    };

    const { data } = await createPurchaseOrder({ variables: order });

    dispatch(setPurchaseOrder(data.createPurchaseOrder));
    dispatch(setPurchaseOrderInitialized(true));
  };

  const handleResetPurchaseOrder = async (e: any) => {
    e.preventDefault();
    dispatch(resetPurchaseOrder());
    setSelectedProvider(null);
    await refetchCodeOrder();
    resetForm();
  };

  const setApprovePurchaseOrder = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await approvePurchaseOrder({
        variables: { purchaseOrderId: purchaseOrderData?._id },
      });
      if (data) {
        showToast({
          detail: "Compra Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate(
          `${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${data.approvePurchaseOrder._id}`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleProviderChange = async (
    event: SingleValue<IReactSelect>,
    action: ActionMeta<IReactSelect>
  ) => {
    setSelectedProvider(event);
    setFieldValue(action.name || "", event ? event.value : "");
  };

  const onCreateProvider = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createProvider({
        variables: {
          name: inputValue,
          address: "",
          phoneNumber: "",
        },
      });

      if (data) {
        showToast({
          detail: "Proveedor creado",
          severity: ToastSeverity.Success,
        });

        setSelectedProvider({
          value: data.createProvider._id,
          label: data.createProvider.name,
        });

        setFieldValue("provider", data.createProvider._id);
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
    isValid,
    isSubmitting,
    setFieldValue,
    resetForm,
    errors,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Orden de compra creada",
    handleSubmit: onSubmit,
    validationSchema: schemaFormPurchaseOrder,
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2"
    >
      <div className="flex flex-col items-center text-center gap-2 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">
          Nueva Orden de Compra
        </h2>
        <p className="text-gray-500 text-sm">
          Completa los detalles para registrar la compra
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Información del proveedor y fecha */}
        <section className="flex flex-col gap-3 border-r md:border-r-gray-300 md:pr-6">
          <div className="flex flex-col">
            <LabelInput name="date" label="Fecha de compra" />
            <Calendar
              name="date"
              value={values.date}
              onChange={handleChange}
              showIcon
              disabled={purchaseOrderInitialized}
            />
          </div>
          <div className="flex flex-col">
            <SelectInput
              label="Proveedor"
              name="provider"
              placeholder="Seleccionar proveedor"
              mandatory
              options={listProviderSelect}
              error={errors.provider ? errors.provider : ""}
              onChange={handleProviderChange}
              onCreateOption={onCreateProvider}
              value={selectedProvider}
              disabled={purchaseOrderInitialized}
            />
          </div>
        </section>
        <div className="flex justify-center">
          {!purchaseOrderInitialized ? (
            <Button
              icon="pi pi-plus"
              type="submit"
              severity="success"
              label="Crear compra"
              disabled={!isValid || isSubmitting}
            />
          ) : (
            <section className="flex flex-col items-center justify-center">
              <LabelInput name="total" label="Total de compra" />
              <span className="text-2xl font-semibold text-green-600">
                {`${purchaseOrderData?.total} ${currency}`}
              </span>
            </section>
          )}
        </div>

        {purchaseOrderInitialized && (
          <section className="flex flex-col gap-5 rounded-md">
            <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
              <span className="text-gray-600 text-sm">Código de Orden</span>
              <span className="text-xl font-bold text-gray-800">
                {codeOrder}
              </span>
              {purchaseOrderData?.status && (
                <Tag
                  severity={
                    getStatus(purchaseOrderData?.status)?.severity as
                      | "danger"
                      | "success"
                      | "info"
                      | "warning"
                  }
                >
                  {getStatus(purchaseOrderData?.status)?.label}
                </Tag>
              )}
            </div>

            <div className="flex flex-row justify-center gap-4">
              <Button
                type="button"
                severity="warning"
                label="Reiniciar"
                onClick={handleResetPurchaseOrder}
                className="w-auto"
              />
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar Compra"
                onClick={setApprovePurchaseOrder}
                className="w-auto"
              />
            </div>
          </section>
        )}
      </div>
    </form>
  );
};
export default PurchaseOrderForm;
