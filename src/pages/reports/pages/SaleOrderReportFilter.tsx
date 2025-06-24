import { useApolloClient } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FC, useState } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import SingleCalendarInput from "../../../components/SingleCalendarInput/SingleCalendarInput";
import { REPORT_SALE_ORDER } from "../../../graphql/queries/SaleOrder";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { IClient } from "../../../utils/interfaces/Client";
import { IFilterSaleOrderInput } from "../../../utils/interfaces/SaleOrder";
import useClientList from "../../client/hooks/useClientList";
import { saleOrderStatusOptions } from "../../order/utils/saleOrderStatusMock";
import { generateSaleOrderReportPDF } from "../utils/generateSaleOrderReportPDF";
import useAuth from "../../auth/hooks/useAuth";

interface SaleOrderReportFilterProps {
  setVisibleSaleOrderFilter: (isVisible: boolean) => void;
}

const SaleOrderReportFilter: FC<SaleOrderReportFilterProps> = ({
  setVisibleSaleOrderFilter,
}) => {
  const { listClient, loadingListClient } = useClientList();
  const {currency}=useAuth();

  const client = useApolloClient();

  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const initialValues: IFilterSaleOrderInput = {
    startDate: null,
    endDate: null,
    client: "",
    status: "Todos",
  };

  const onSubmit = async () => {
    const { data } = await client.query({
      query: REPORT_SALE_ORDER,
      variables: values,
      fetchPolicy: "network-only",
    });

    if (data) {
      const reportFilters = {
        client: selectedClient?.fullName || "Todos",
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
      };

      generateSaleOrderReportPDF(data.saleOrderReport,currency, reportFilters);
      setVisibleSaleOrderFilter(false);
      resetForm();
    }
  };

  const handleClientChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedClient(value ? value : null);
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

  if (loadingListClient) {
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
        label="Cliente"
        name="client"
        optionLabel="fullName"
        placeholder="Seleccionar cliente"
        filter={true}
        showClear={true}
        options={listClient}
        value={selectedClient}
        error={errors.client ? errors.client : ""}
        onChange={handleClientChange}
      />

      <DropdownInput
        label="Estado"
        name="status"
        optionLabel="label"
        placeholder="Seleccionar estado"
        mandatory
        options={saleOrderStatusOptions}
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

export default SaleOrderReportFilter;
