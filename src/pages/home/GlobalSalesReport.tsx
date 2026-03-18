import { useQuery } from "@apollo/client";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import useAuth from "../auth/hooks/useAuth";
import { LIST_SALE_ORDER } from "../../graphql/queries/SaleOrder";
import { getDate } from "../order/utils/getDate";
import { getStatus } from "../order/utils/getStatus";

const GlobalSalesReport = () => {
  const { currency } = useAuth();

  const { data, loading } = useQuery(LIST_SALE_ORDER, {
    fetchPolicy: "network-only",
  });

  const orders = data?.listSaleOrder ?? [];

  return (
    <div className="p-5 shadow-sm rounded-lg border border-gray-200 bg-white">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">
          Reporte Global de Ventas
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Todas las ventas registradas en el sistema por todos los usuarios.
        </p>
      </div>

      <DataTable
        value={orders}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage="No hay ventas registradas."
        size="small"
        scrollable
        scrollHeight="420px"
      >
        <Column
          field="date"
          header="Fecha"
          body={(row) => getDate(row.date) ?? "—"}
          style={{ minWidth: "110px" }}
        />
        <Column
          field="code"
          header="Código"
          style={{ minWidth: "110px" }}
        />
        <Column
          field="client.fullName"
          header="Cliente"
          style={{ minWidth: "150px" }}
        />
        <Column
          field="created_by.user_name"
          header="Vendedor"
          style={{ minWidth: "120px" }}
        />
        <Column
          field="payment_method"
          header="Pago"
          style={{ minWidth: "100px" }}
        />
        <Column
          field="status"
          header="Estado"
          body={(row) => {
            const s = getStatus(row.status);
            return (
              <Tag severity={s?.severity as "success" | "danger" | "info" | "warning"}>
                {s?.label}
              </Tag>
            );
          }}
          style={{ minWidth: "100px" }}
        />
        <Column
          field="total"
          header={`Total (${currency})`}
          body={(row) => `${row.total} ${currency}`}
          style={{ minWidth: "120px" }}
          align="right"
        />
      </DataTable>
    </div>
  );
};

export default GlobalSalesReport;
