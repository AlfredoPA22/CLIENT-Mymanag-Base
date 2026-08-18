import { useApolloClient, useQuery } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FC, useMemo } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import SingleCalendarInput from "../../../components/SingleCalendarInput/SingleCalendarInput";
import { LIST_CASH_REGISTER } from "../../../graphql/queries/CashRegister";
import { LIST_USER } from "../../../graphql/queries/User";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { generateCashRegisterReportPDF } from "../utils/generateCashRegisterReportPDF";
import useAuth from "../../auth/hooks/useAuth";

const STATUS_OPTIONS = [
  { label: "Abierta", value: "ABIERTA" },
  { label: "Cerrada", value: "CERRADA" },
];

interface ICashRegisterRow {
  _id: string;
  status: string;
  opening_amount: number;
  opening_amount_bs?: number | null;
  opening_date: string;
  opened_by?: { _id: string; user_name: string } | null;
  closing_amount?: number | null;
  closing_amount_bs?: number | null;
  closing_date?: string | null;
  closed_by?: { _id: string; user_name: string } | null;
  expected_amount?: number;
  expected_amount_bs?: number;
}

interface CashRegisterReportFilterProps {
  setVisible: (isVisible: boolean) => void;
}

const CashRegisterReportFilter: FC<CashRegisterReportFilterProps> = ({ setVisible }) => {
  const { currency } = useAuth();
  const client = useApolloClient();

  const { data: userData } = useQuery(LIST_USER, { fetchPolicy: "cache-first" });

  const userOptions = useMemo(() => {
    const users = userData?.listUser ?? [];
    return users
      .filter((u: any) => u.is_active)
      .map((u: any) => ({ label: u.user_name, value: u._id }));
  }, [userData]);

  const initialValues = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    userId: "",
    status: "",
  };

  const onSubmit = async () => {
    // listCashRegister no tiene filtros en el backend — ya trae todo el
    // histórico con expected_amount recalculado, así que se filtra acá.
    const { data } = await client.query({
      query: LIST_CASH_REGISTER,
      fetchPolicy: "network-only",
    });

    if (data) {
      const all: ICashRegisterRow[] = data.listCashRegister ?? [];
      const filtered = all.filter((r) => {
        if (values.startDate) {
          const s = new Date(values.startDate);
          s.setHours(0, 0, 0, 0);
          if (new Date(Number(r.opening_date) || r.opening_date) < s) return false;
        }
        if (values.endDate) {
          const e = new Date(values.endDate);
          e.setHours(23, 59, 59, 999);
          if (new Date(Number(r.opening_date) || r.opening_date) > e) return false;
        }
        if (values.userId && r.opened_by?._id !== values.userId) return false;
        if (values.status && r.status !== values.status) return false;
        return true;
      });

      const userLabel = userOptions.find((u: any) => u.value === values.userId)?.label;
      generateCashRegisterReportPDF(filtered, currency, {
        userLabel,
        status: values.status
          ? STATUS_OPTIONS.find((s) => s.value === values.status)?.label
          : undefined,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setVisible(false);
      resetForm();
    }
  };

  const handleUserChange = (e: AutoCompleteChangeEvent) => {
    setFieldValue("userId", e.value ?? "");
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

      <DropdownInput
        label="Usuario (quién abrió)"
        name="userId"
        optionLabel="label"
        optionValue="value"
        placeholder="Todos"
        showClear
        filter
        options={userOptions}
        value={values.userId}
        error={errors.userId ?? ""}
        onChange={handleUserChange}
      />

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

export default CashRegisterReportFilter;
