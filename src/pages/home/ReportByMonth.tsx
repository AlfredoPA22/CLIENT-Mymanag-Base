import { Card } from "primereact/card";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table, { DataTableColumn } from "../../components/datatable/Table";
import LabelInput from "../../components/labelInput/LabelInput";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import useTableGlobalFilter from "../../hooks/useTableGlobalFilter";
import { ISaleOrder } from "../../utils/interfaces/SaleOrder";
import { getDate } from "../order/utils/getDate";
import { getStatus } from "../order/utils/getStatus";
import useReportByMonth from "./hooks/useReportByMonth";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import useAuth from "../auth/hooks/useAuth";

const ReportByMonth = () => {
  const { listSaleOrder, loadingListSaleOrder } = useReportByMonth();
  const navigate = useNavigate();
  const { currency } = useAuth();

  const statusBodyTemplate = (rowData: ISaleOrder) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag
          severity={
            severity as "secondary" | "success" | "info" | "warning" | "danger"
          }
        >
          {label}
        </Tag>
      );
    }
    return null;
  };

  const dateBodyTemplate = (rowData: ISaleOrder) => {
    if (rowData.date) {
      const date = getDate(rowData.date);
      return <Tag>{date}</Tag>;
    }
    return null;
  };

  const clientBodyTemplate = (rowData: ISaleOrder) => {
    if (rowData.client) {
      return <label>{rowData.client.fullName}</label>;
    }
    return null;
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<ISaleOrder[]>
  ) => {
    navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<ISaleOrder>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
    },
    {
      field: "date",
      header: "Fecha",
      sortable: true,
      body: dateBodyTemplate,
    },
    {
      field: "client.firstName",
      header: "Cliente",
      sortable: true,
      body: clientBodyTemplate,
    },
    {
      field: "created_by.user_name",
      header: "Usuario",
      sortable: true,
    },
    {
      field: "total",
      header: "Total",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: ISaleOrder) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.total} ${currency}`}
        />
      ),
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  return (
    <Card className="lg:col-span-2" title="Últimas ventas del mes">
      {loadingListSaleOrder && <TableSkeleton />}
      <Table
        columns={columns}
        data={listSaleOrder}
        emptyMessage="Sin ventas."
        size="small"
        dataFilters={filters}
        tableHeader={renderFilterInput}
        onSelectionChange={handleSelectionChange}
      />
    </Card>
  );
};

export default ReportByMonth;
