import { useApolloClient, useQuery } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FC, useMemo } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import SingleCalendarInput from "../../../components/SingleCalendarInput/SingleCalendarInput";
import { LIST_COMMISSIONS } from "../../../graphql/queries/Commission";
import { LIST_USER } from "../../../graphql/queries/User";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { commissionStatus } from "../../../utils/enums/commissionStatus.enum";
import { generateCommissionReportPDF } from "../../commission/utils/generateCommissionReportPDF";
import useAuth from "../../auth/hooks/useAuth";

const STATUS_OPTIONS = [
  { label: "Pendiente", value: commissionStatus.PENDIENTE },
  { label: "Pagada", value: commissionStatus.PAGADA },
  { label: "Anulada", value: commissionStatus.ANULADA },
];

interface CommissionReportFilterProps {
  setVisible: (isVisible: boolean) => void;
}

const CommissionReportFilter: FC<CommissionReportFilterProps> = ({ setVisible }) => {
  const { currency, isGlobal } = useAuth();
  const client = useApolloClient();

  // Igual que en CommissionList: el filtro de vendedor solo tiene sentido
  // para un usuario con acceso global (uno sin ese acceso ya solo ve las
  // suyas, así que el filtro no le agregaría nada).
  const { data: userData } = useQuery(LIST_USER, {
    skip: !isGlobal,
    fetchPolicy: "cache-first",
  });

  const sellerOptions = useMemo(() => {
    const users = userData?.listUser ?? [];
    return users
      .filter((u: any) => u.is_active)
      .map((u: any) => ({ label: u.user_name, value: u._id }));
  }, [userData]);

  const initialValues = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    sellerId: "",
    status: "",
  };

  const onSubmit = async () => {
    const { data } = await client.query({
      query: LIST_COMMISSIONS,
      variables: {
        filter: {
          sellerId: values.sellerId || undefined,
          status: values.status || undefined,
          startDate: values.startDate ?? undefined,
          endDate: values.endDate ?? undefined,
        },
      },
      fetchPolicy: "network-only",
    });

    if (data) {
      const sellerLabel = sellerOptions.find((s: any) => s.value === values.sellerId)?.label;
      generateCommissionReportPDF(data.listCommissions, currency, {
        sellerLabel,
        status: values.status || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setVisible(false);
      resetForm();
    }
  };

  const handleSellerChange = (e: AutoCompleteChangeEvent) => {
    setFieldValue("sellerId", e.value ?? "");
  };

  const handleStatusChange = (e: AutoCompleteChangeEvent) => {
    setFieldValue("status", e.value ?? "");
  };

  const { handleSubmit, resetForm, values, errors, setFieldValue, isSubmitting, handleChange } =
    useFormikForm({
      initialValues,
      msgSuccess: "Reporte Generado",
      handleSubmit: onSubmit,
    });

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-2">
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

      {isGlobal && (
        <DropdownInput
          label="Vendedor"
          name="sellerId"
          optionLabel="label"
          optionValue="value"
          placeholder="Todos"
          showClear
          filter
          options={sellerOptions}
          value={values.sellerId}
          error={errors.sellerId ?? ""}
          onChange={handleSellerChange}
        />
      )}

      <DropdownInput
        label="Estado"
        name="status"
        optionLabel="label"
        optionValue="value"
        placeholder="Todos"
        showClear
        options={STATUS_OPTIONS}
        value={values.status}
        error={errors.status ?? ""}
        onChange={handleStatusChange}
      />

      <section className="flex justify-center items-center md:col-span-2">
        <Button type="submit" severity="info" label="Generar reporte" disabled={isSubmitting} />
      </section>
    </form>
  );
};

export default CommissionReportFilter;
