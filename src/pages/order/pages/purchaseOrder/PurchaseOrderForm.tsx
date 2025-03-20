import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LabelInput from "../../../../components/labelInput/LabelInput";
import {
  APPROVE_PURCHASE_ORDER,
  CREATE_PURCHASE_ORDER,
} from "../../../../graphql/mutations/PurchaseOrder";
import { GENERATE_CODE } from "../../../../graphql/queries/CodeGenerator";
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
import { showToast } from "../../../../utils/toastUtils";
import { getStatus } from "../../utils/getStatus";
import { schemaFormPurchaseOrder } from "../../validations/FormPurchaseOrderValidation";
import { useNavigate } from "react-router-dom";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import useProviderList from "../../../provider/hooks/useProviderList";
import { DropdownProps } from "primereact/dropdown";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";

const PurchaseOrderForm = () => {
  const {
    data: { generateCode: codeOrder } = "",
    loading: loadingCode,
    error: errorCodeOrder,
    refetch: refetchCodeOrder,
  } = useQuery(GENERATE_CODE, {
    variables: { type: codeType.PURCHASE_ORDER },
    fetchPolicy: "network-only",
  });

  const { listProvider } = useProviderList();

  const [selectedProvider, setSelectedProvider] = useState(null);

  const navigate = useNavigate();

  const [createPurchaseOrder] = useMutation(CREATE_PURCHASE_ORDER, {
    refetchQueries: [{ query: LIST_PURCHASE_ORDER }],
  });

  const [approvePurchaseOrder] = useMutation(APPROVE_PURCHASE_ORDER, {
    refetchQueries: [{ query: LIST_PURCHASE_ORDER }, { query: LIST_PRODUCT }],
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

  const handleProviderChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedProvider(value ? value : "");
    e.target.value = value ? value._id : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const setApprovePurchaseOrder = async () => {
    try {
      const { data } = await approvePurchaseOrder({
        variables: { purchaseOrderId: purchaseOrderData?._id },
      });
      if (data) {
        showToast({
          detail: "Compra Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate("/order/purchaseOrder");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const providerOptionTemplate = (option: { name: string; code: string }) => {
    return (
      <span className="whitespace-normal">
        {`${option.name} (${option.code})`}
      </span>
    );
  };

  const selectedProviderTemplate = (
    option: { id: string; name: string; code: string },
    props: DropdownProps
  ) => {
    if (option) {
      return (
        <span className="block truncate max-sm:w-3/4 md:w-3/4 lg:w-auto xl:w-auto">
          {`${option.name} (${option.code})`}
        </span>
      );
    }
    return <span>{props.placeholder}</span>;
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
      className="flex md:flex-row flex-col justify-between items-center gap-10"
    >
      <section className="grid grid-cols-1 md:flex justify-center items-end md:gap-10 gap-5 order-2 md:order-1">
        <div>
          <LabelInput name="date" label="Fecha de compra" />
          <Calendar
            name="date"
            value={values.date}
            onChange={handleChange}
            showIcon
            disabled={purchaseOrderInitialized}
          />
        </div>
        <DropdownInput
          className="md:w-[300px]"
          label="Proveedor"
          name="provider"
          optionLabel="name"
          placeholder="Seleccionar proveedor"
          filter={true}
          showClear={true}
          mandatory
          itemTemplate={providerOptionTemplate}
          valueTemplate={selectedProviderTemplate}
          options={listProvider}
          value={selectedProvider}
          error={errors.provider ? errors.provider : ""}
          onChange={handleProviderChange}
          disabled={purchaseOrderInitialized}
        />

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
            <Button
              type="button"
              severity="warning"
              label="Reiniciar"
              onClick={handleResetPurchaseOrder}
            />
          )}
        </div>
      </section>
      {purchaseOrderInitialized && (
        <section className="flex flex-col justify-center items-center gap-2 order-3 md:order-2">
          <LabelInput name="date" label="Total de compra" />
          <Tag
            value={`${purchaseOrderData?.total} ${currencySymbol}`}
            severity={"info"}
            className="text-xl"
          />
        </section>
      )}
      <section className="flex justify-start items-start order-1 md:order-3">
        {loadingCode ? (
          "cargando"
        ) : (
          <div className="flex flex-col gap-2 items-center justify-center">
            <span className="text-2xl font-bold">{codeOrder}</span>{" "}
            {purchaseOrderData?.status && purchaseOrderInitialized && (
              <>
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
                <Button
                  icon="pi pi-check-circle"
                  type="button"
                  severity="success"
                  label="Aprobar compra"
                  onClick={setApprovePurchaseOrder}
                />
              </>
            )}
          </div>
        )}
      </section>
    </form>
  );
};

export default PurchaseOrderForm;
