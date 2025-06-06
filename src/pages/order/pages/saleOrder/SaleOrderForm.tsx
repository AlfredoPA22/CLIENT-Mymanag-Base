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
import { CREATE_CLIENT } from "../../../../graphql/mutations/Client";
import {
  APPROVE_SALE_ORDER,
  CREATE_SALE_ORDER,
} from "../../../../graphql/mutations/SaleOrder";
import { LIST_CLIENT } from "../../../../graphql/queries/Client";
import { GENERATE_CODE } from "../../../../graphql/queries/CodeGenerator";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import { LIST_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import {
  resetSaleOrder,
  setSaleOrder,
  setSaleOrderInitialized,
} from "../../../../redux/slices/saleOrderSlice";
import { RootState } from "../../../../redux/store";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { codeType } from "../../../../utils/enums/codeType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { ISaleOrderInput } from "../../../../utils/interfaces/SaleOrder";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { showToast } from "../../../../utils/toastUtils";
import useClientList from "../../../client/hooks/useClientList";
import { getStatus } from "../../utils/getStatus";
import { schemaFormSaleOrder } from "../../validations/FormSaleOrderValidation";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { saleOrderPaymentMethodOptions } from "../../utils/saleOrderPaymentMethodMock";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";

const SaleOrderForm = () => {
  const {
    data: { generateCode: codeOrder } = "",
    error: errorCodeOrder,
    refetch: refetchCodeOrder,
  } = useQuery(GENERATE_CODE, {
    variables: { type: codeType.SALE_ORDER },
    fetchPolicy: "network-only",
  });

  const { listClientSelect } = useClientList();

  const [selectedClient, setSelectedClient] = useState<IReactSelect | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Contado");

  const navigate = useNavigate();

  const [createSaleOrder] = useMutation(CREATE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }],
  });

  const [approveSaleOrder] = useMutation(APPROVE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  const [createClient] = useMutation(CREATE_CLIENT, {
    refetchQueries: [{ query: LIST_CLIENT }],
  });

  const { saleOrderInitialized, saleOrderData } = useSelector(
    (state: RootState) => state.saleOrderSlice
  );

  const dispatch = useDispatch();

  const initialValues: ISaleOrderInput = {
    date: new Date(),
    client: "",
    payment_method: "Contado",
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
      payment_method: values.payment_method,
    };

    const { data } = await createSaleOrder({ variables: order });

    dispatch(setSaleOrder(data.createSaleOrder));
    dispatch(setSaleOrderInitialized(true));
  };

  const handleResetSaleOrder = async (e: any) => {
    e.preventDefault();
    dispatch(resetSaleOrder());
    setSelectedClient(null);
    setSelectedPaymentMethod("Contado");
    await refetchCodeOrder();
    resetForm();
  };

  const setApproveSaleOrder = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await approveSaleOrder({
        variables: { saleOrderId: saleOrderData?._id },
      });
      if (data) {
        showToast({
          detail: "Venta Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate(
          `${ROUTES_MOCK.SALE_ORDERS}/detalle/${data.approveSaleOrder._id}`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleClientChange = async (
    event: SingleValue<IReactSelect>,
    action: ActionMeta<IReactSelect>
  ) => {
    setSelectedClient(event);
    setFieldValue(action.name || "", event ? event.value : "");
  };

  const onCreateClient = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createClient({
        variables: {
          fullName: inputValue,
          email: "",
          address: "",
          phoneNumber: "",
        },
      });

      if (data) {
        showToast({
          detail: "Cliente creado",
          severity: ToastSeverity.Success,
        });

        setSelectedClient({
          value: data.createClient._id,
          label: data.createClient.fullName,
        });

        setFieldValue("client", data.createClient._id);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handlePaymentMethodChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedPaymentMethod(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
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
      className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2"
    >
      <div className="flex flex-col items-center text-center gap-2 mb-5">
        <h2 className="text-2xl font-bold text-gray-800">
          Nueva Orden de Venta
        </h2>
        <p className="text-gray-500 text-sm">
          Completa los detalles para registrar la venta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Información del proveedor y fecha */}
        <section className="flex flex-col gap-3 border-r md:border-r-gray-300 md:pr-6">
          <div className="grid xl:grid-cols-2 gap-5">
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
              label="Metodo de pago"
              name="payment_method"
              optionLabel="label"
              placeholder="Seleccionar metodo de pago"
              mandatory
              options={saleOrderPaymentMethodOptions}
              value={selectedPaymentMethod}
              error={errors.payment_method ? errors.payment_method : ""}
              onChange={handlePaymentMethodChange}
              disabled={saleOrderInitialized}
            />
          </div>
          <div className="flex flex-col">
            <SelectInput
              label="Cliente"
              name="client"
              placeholder="Seleccionar cliente"
              mandatory
              options={listClientSelect}
              error={errors.client ? errors.client : ""}
              onChange={handleClientChange}
              onCreateOption={onCreateClient}
              value={selectedClient}
              disabled={saleOrderInitialized}
            />
          </div>
        </section>
        <div className="flex justify-center">
          {!saleOrderInitialized ? (
            <Button
              icon="pi pi-plus"
              type="submit"
              severity="success"
              label="Crear venta"
              disabled={!isValid || isSubmitting}
            />
          ) : (
            <section className="flex flex-col items-center justify-center">
              <LabelInput name="total" label="Total de venta" />
              <span className="text-2xl font-semibold text-green-600">
                {`${saleOrderData?.total} ${currencySymbol}`}
              </span>
            </section>
          )}
        </div>

        {saleOrderInitialized && (
          <section className="flex flex-col gap-5 rounded-md">
            <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
              <span className="text-gray-600 text-sm">Código de Orden</span>
              <span className="text-xl font-bold text-gray-800">
                {codeOrder}
              </span>
              {saleOrderData?.status && (
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
              )}
            </div>

            <div className="flex flex-row justify-center gap-4">
              <Button
                type="button"
                severity="warning"
                label="Reiniciar"
                onClick={handleResetSaleOrder}
                className="w-auto"
              />
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar Venta"
                onClick={setApproveSaleOrder}
                className="w-auto"
              />
            </div>
          </section>
        )}
      </div>
    </form>
  );
};

export default SaleOrderForm;
