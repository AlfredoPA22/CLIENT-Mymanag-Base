import { useApolloClient } from "@apollo/client";
import { Button } from "primereact/button";
import { FC } from "react";
import SingleCalendarInput from "../../../components/SingleCalendarInput/SingleCalendarInput";
import { REPORT_CUENTAS_COBRAR } from "../../../graphql/queries/SaleOrder";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { generateCuentasCobrarReportPDF } from "../utils/generateCuentasCobrarReportPDF";
import useAuth from "../../auth/hooks/useAuth";

interface CuentasCobrarReportFilterProps {
  setVisible: (isVisible: boolean) => void;
}

const CuentasCobrarReportFilter: FC<CuentasCobrarReportFilterProps> = ({ setVisible }) => {
  const { currency } = useAuth();
  const client = useApolloClient();

  const initialValues = {
    startDate: null as Date | null,
    endDate: null as Date | null,
  };

  const onSubmit = async () => {
    const { data } = await client.query({
      query: REPORT_CUENTAS_COBRAR,
      variables: values,
      fetchPolicy: "network-only",
    });

    if (data) {
      generateCuentasCobrarReportPDF(data.reportCuentasCobrar, currency, {
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setVisible(false);
      resetForm();
    }
  };

  const { handleSubmit, resetForm, values, errors, isSubmitting, handleChange } =
    useFormikForm({
      initialValues,
      msgSuccess: "Reporte Generado",
      handleSubmit: onSubmit,
    });

  return (
    <form onSubmit={handleSubmit} className="grid xl:grid-cols-2 gap-2">
      <SingleCalendarInput
        inputId="startDate"
        name="startDate"
        label="Fecha de inicio"
        value={values.startDate}
        showIcon
        readOnlyInput
        error={errors.startDate ?? ""}
        onChange={handleChange}
      />

      <SingleCalendarInput
        inputId="endDate"
        name="endDate"
        label="Fecha final"
        value={values.endDate}
        showIcon
        readOnlyInput
        error={errors.endDate ?? ""}
        onChange={handleChange}
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

export default CuentasCobrarReportFilter;
