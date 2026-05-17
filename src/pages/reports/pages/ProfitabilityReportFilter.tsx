import { useApolloClient } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import SingleCalendarInput from "../../../components/SingleCalendarInput/SingleCalendarInput";
import { REPORT_PROFITABILITY } from "../../../graphql/queries/Profitability";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { IFilterProfitabilityInput } from "../../../utils/interfaces/Profitability";
import { generateProfitabilityReportPDF } from "../utils/generateProfitabilityReportPDF";
import useAuth from "../../auth/hooks/useAuth";

interface ProfitabilityReportFilterProps {
  setVisible: (isVisible: boolean) => void;
}

const ProfitabilityReportFilter: FC<ProfitabilityReportFilterProps> = ({ setVisible }) => {
  const apolloClient = useApolloClient();
  const { currency } = useAuth();

  const initialValues: IFilterProfitabilityInput = {
    startDate: null,
    endDate: null,
  };

  const onSubmit = async () => {
    const { data } = await apolloClient.query({
      query: REPORT_PROFITABILITY,
      variables: values,
      fetchPolicy: "network-only",
    });

    if (data?.profitabilityReport) {
      generateProfitabilityReportPDF(data.profitabilityReport, currency, values);
      setVisible(false);
      resetForm();
    }
  };

  const { handleSubmit, resetForm, values, errors, isSubmitting, handleChange } =
    useFormikForm({
      initialValues,
      msgSuccess: "Reporte generado",
      handleSubmit: onSubmit,
    });

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <p className="text-sm text-gray-500">
        Seleccioná el período para calcular ganancia bruta por producto y categoría.
        El costo se calcula usando el último costo registrado de cada producto.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          severity="info"
          label="Generar reporte"
          icon="pi pi-chart-line"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </div>
    </form>
  );
};

export default ProfitabilityReportFilter;
