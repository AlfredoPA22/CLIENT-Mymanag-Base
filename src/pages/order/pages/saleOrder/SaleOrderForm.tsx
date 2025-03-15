import { useMutation, useQuery } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import LabelInput from "../../../../components/labelInput/LabelInput";
import {
  APPROVE_SALE_ORDER,
  CREATE_SALE_ORDER,
} from "../../../../graphql/mutations/SaleOrder";
import { GENERATE_CODE } from "../../../../graphql/queries/CodeGenerator";
import { LIST_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import {
  resetSaleOrder,
  setSaleOrder,
  setSaleOrderInitialized,
} from "../../../../redux/slices/saleOrderSlice";
import { RootState } from "../../../../redux/store";
import { codeType } from "../../../../utils/enums/codeType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { ISaleOrderInput } from "../../../../utils/interfaces/SaleOrder";
import { showToast } from "../../../../utils/toastUtils";
import useClientList from "../../../client/hooks/useClientList";
import { getStatus } from "../../utils/getStatus";
import { schemaFormSaleOrder } from "../../validations/FormSaleOrderValidation";
import { useNavigate } from "react-router-dom";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { DropdownProps } from "primereact/dropdown";

const SaleOrderForm = () => {
  const {
    data: { generateCode: codeOrder } = "",
    loading: loadingCode,
    error: errorCodeOrder,
    refetch: refetchCodeOrder,
  } = useQuery(GENERATE_CODE, {
    variables: { type: codeType.SALE_ORDER },
    fetchPolicy: "network-only",
  });

  const { listClient } = useClientList();

  const [selectedClient, setSelectedClient] = useState(null);

  const navigate = useNavigate();

  const [createSaleOrder] = useMutation(CREATE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }],
  });

  const [approveSaleOrder] = useMutation(APPROVE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  const { saleOrderInitialized, saleOrderData } = useSelector(
    (state: RootState) => state.saleOrderSlice
  );

  const dispatch = useDispatch();

  const initialValues: ISaleOrderInput = {
    date: new Date(),
    client: "",
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
    const order: ISaleOrderInput = {
      date: values.date,
      client: values.client,
    };

    const { data } = await createSaleOrder({ variables: order });

    dispatch(setSaleOrder(data.createSaleOrder));
    dispatch(setSaleOrderInitialized(true));
  };

  const handleResetSaleOrder = async (e: any) => {
    e.preventDefault();
    dispatch(resetSaleOrder());
    setSelectedClient(null);
    await refetchCodeOrder();
    resetForm();
  };

  const handleClientChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedClient(value ? value : "");
    e.target.value = value ? value._id : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const setApproveSaleOrder = async () => {
    try {
      const { data } = await approveSaleOrder({
        variables: { saleOrderId: saleOrderData?._id },
      });
      if (data) {
        showToast({
          detail: "Venta Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate("/order/saleOrder");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const clientOptionTemplate = (option: {
    firstName: string;
    lastName: string;
    code: string;
  }) => {
    return (
      <span className="whitespace-normal">
        {`${option.firstName} ${option.lastName} (${option.code})`}
      </span>
    );
  };

  const selectedClientTemplate = (
    option: { id: string; firstName: string; lastName: string; code: string },
    props: DropdownProps
  ) => {
    if (option) {
      return (
        <span className="block truncate max-sm:w-3/4 md:w-3/4 lg:w-auto xl:w-auto">
          {`${option.firstName} ${option.lastName} (${option.code})`}
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
    errors,
    resetForm,
    setFieldValue,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Orden de venta creada",
    handleSubmit: onSubmit,
    validationSchema: schemaFormSaleOrder,
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex md:flex-row flex-col justify-between items-center gap-10"
    >
      <section className="grid grid-cols-1 md:flex justify-center items-end md:gap-10 gap-5 order-2 md:order-1">
        <div>
          <LabelInput name="date" label="Fecha de venta" />
          <Calendar
            name="date"
            value={values.date}
            onChange={handleChange}
            showIcon
            disabled={saleOrderInitialized}
          />
        </div>
        <DropdownInput
          className="md:w-[300px]"
          label="Cliente"
          name="client"
          optionLabel="firstName"
          placeholder="Seleccionar cliente"
          filter={true}
          showClear={true}
          mandatory
          itemTemplate={clientOptionTemplate}
          valueTemplate={selectedClientTemplate}
          options={listClient}
          value={selectedClient}
          error={errors.client ? errors.client : ""}
          onChange={handleClientChange}
          disabled={saleOrderInitialized}
        />

        <div>
          {!saleOrderInitialized ? (
            <Button
              type="submit"
              severity="success"
              label="Crear Orden de venta"
              disabled={!isValid || isSubmitting}
            />
          ) : (
            <Button
              type="button"
              severity="warning"
              label="Reiniciar"
              onClick={handleResetSaleOrder}
            />
          )}
        </div>
      </section>
      {saleOrderInitialized && (
        <section className="flex justify-center items-center gap-10 order-3 md:order-2">
          <LabelInput name="date" label="Total de venta: " />
          <Tag
            value={`${saleOrderData?.total} ${currencySymbol}`}
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
            {saleOrderData?.status && saleOrderInitialized && (
              <>
                <Tag
                  severity={
                    getStatus(saleOrderData?.status)?.severity as
                      | "danger"
                      | "success"
                      | "info"
                      | "warning"
                  }
                >
                  {getStatus(saleOrderData?.status)?.label}
                </Tag>
                <Button
                  type="button"
                  severity="success"
                  label="Aprobar venta"
                  onClick={setApproveSaleOrder}
                />
              </>
            )}
          </div>
        )}
      </section>
    </form>
  );
};

export default SaleOrderForm;
