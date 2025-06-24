import { useApolloClient } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FC, useState } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { REPORT_PURCHASE_ORDER } from "../../../graphql/queries/PurchaseOrder";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { IProvider } from "../../../utils/interfaces/Provider";
import { IFilterPurchaseOrderInput } from "../../../utils/interfaces/PurchaseOrder";
import { purchaseOrderStatusOptions } from "../../order/utils/purchaseOrderStatusMock";
import useProviderList from "../../provider/hooks/useProviderList";
import { generatePurchaseOrderReportPDF } from "../utils/generatePurchaseOrderReportPDF";
import SingleCalendarInput from "../../../components/SingleCalendarInput/SingleCalendarInput";
import useAuth from "../../auth/hooks/useAuth";

interface PurchaseOrderReportFilterProps {
  setVisiblePurchaseOrderFilter: (isVisible: boolean) => void;
}

const PurchaseOrderReportFilter: FC<PurchaseOrderReportFilterProps> = ({
  setVisiblePurchaseOrderFilter,
}) => {
  const { listProvider, loadingListProvider } = useProviderList();
  const {currency}=useAuth();

  const client = useApolloClient();

  const [selectedProvider, setSelectedOProvider] = useState<IProvider | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const initialValues: IFilterPurchaseOrderInput = {
    startDate: null,
    endDate: null,
    provider: "",
    status: "Todos",
  };

  const onSubmit = async () => {
    const { data } = await client.query({
      query: REPORT_PURCHASE_ORDER,
      variables: values,
      fetchPolicy: "network-only",
    });

    if (data) {
      const reportFilters = {
        provider: selectedProvider?.name || "Todos",
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
      };
      generatePurchaseOrderReportPDF(data.purchaseOrderReport,currency, reportFilters);
      setVisiblePurchaseOrderFilter(false);
      resetForm();
    }
  };

  const handleProviderChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedOProvider(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const handleStatusChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedStatus(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const {
    handleSubmit,
    resetForm,
    values,
    errors,
    setFieldValue,
    isSubmitting,
    handleChange,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Reporte Generado",
    handleSubmit: onSubmit,
  });

  if (loadingListProvider) {
    return <LoadingSpinner />;
  }
  return (
    <form onSubmit={handleSubmit} className="grid xl:grid-cols-2 gap-2">
      <SingleCalendarInput
        inputId="startDate"
        name="startDate"
        label="Fecha de inicio"
        value={values.startDate}
        showIcon
        readOnlyInput
        error={errors.startDate || ""}
        onChange={handleChange}
      />

      <SingleCalendarInput
        inputId="endDate"
        name="endDate"
        label="Fecha final"
        value={values.endDate}
        showIcon
        readOnlyInput
        error={errors.endDate || ""}
        onChange={handleChange}
      />

      <DropdownInput
        label="Proveedor"
        name="provider"
        optionLabel="name"
        placeholder="Seleccionar proveedor"
        filter={true}
        showClear={true}
        options={listProvider}
        value={selectedProvider}
        error={errors.provider ? errors.provider : ""}
        onChange={handleProviderChange}
      />

      <DropdownInput
        label="Estado"
        name="status"
        optionLabel="label"
        placeholder="Seleccionar estado"
        mandatory
        options={purchaseOrderStatusOptions}
        value={selectedStatus}
        error={errors.status ? errors.status : ""}
        onChange={handleStatusChange}
      />

      <section className="flex justify-center items-center md:col-span-2">
        <Button
          type="submit"
          severity="info"
          label="Generar reporte"
          disabled={isSubmitting}
        />
      </section>
    </form>
  );
};

export default PurchaseOrderReportFilter;
