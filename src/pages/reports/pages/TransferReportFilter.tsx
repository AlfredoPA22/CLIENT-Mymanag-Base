import { useApolloClient } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FC } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import SingleCalendarInput from "../../../components/SingleCalendarInput/SingleCalendarInput";
import { LIST_PRODUCT_TRANSFER } from "../../../graphql/queries/ProductTransfer";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { orderStatus } from "../../../utils/enums/orderStatus.enum";
import { IProductTransfer } from "../../../utils/interfaces/ProductTransfer";
import useWarehouseList from "../../product/hooks/useWarehouseList";
import { generateTransferReportPDF } from "../utils/generateTransferReportPDF";

const STATUS_OPTIONS = [
  { label: "Borrador", value: orderStatus.BORRADOR },
  { label: "Aprobado", value: orderStatus.APROBADO },
];

interface TransferReportFilterProps {
  setVisible: (isVisible: boolean) => void;
}

const TransferReportFilter: FC<TransferReportFilterProps> = ({ setVisible }) => {
  const { listWarehouseSelect } = useWarehouseList();
  const client = useApolloClient();

  const initialValues = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    warehouseId: "",
    status: "",
  };

  const onSubmit = async () => {
    // No hay filtro en el backend para transferencias (listProductTransfer
    // trae todo) — se filtra acá, igual que ya hace la lista de transferencias
    // con su búsqueda global.
    const { data } = await client.query({
      query: LIST_PRODUCT_TRANSFER,
      fetchPolicy: "network-only",
    });

    if (data) {
      const all: IProductTransfer[] = data.listProductTransfer ?? [];
      const filtered = all.filter((t) => {
        if (values.startDate) {
          const s = new Date(values.startDate);
          s.setHours(0, 0, 0, 0);
          if (new Date(t.date) < s) return false;
        }
        if (values.endDate) {
          const e = new Date(values.endDate);
          e.setHours(23, 59, 59, 999);
          if (new Date(t.date) > e) return false;
        }
        if (
          values.warehouseId &&
          t.origin_warehouse?._id !== values.warehouseId &&
          t.destination_warehouse?._id !== values.warehouseId
        ) {
          return false;
        }
        if (values.status && t.status !== values.status) return false;
        return true;
      });

      const warehouseLabel = listWarehouseSelect.find((w: any) => w.value === values.warehouseId)?.label;
      generateTransferReportPDF(filtered, {
        warehouseLabel,
        status: values.status || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
      });
      setVisible(false);
      resetForm();
    }
  };

  const handleWarehouseChange = (e: AutoCompleteChangeEvent) => {
    setFieldValue("warehouseId", e.value ?? "");
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
        label="Almacén (origen o destino)"
        name="warehouseId"
        optionLabel="label"
        optionValue="value"
        placeholder="Todos"
        showClear
        filter
        options={listWarehouseSelect}
        value={values.warehouseId}
        error={errors.warehouseId ?? ""}
        onChange={handleWarehouseChange}
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

export default TransferReportFilter;
