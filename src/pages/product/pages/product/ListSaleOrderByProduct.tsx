import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import { ISaleOrderByProduct } from "../../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { getDate } from "../../../order/utils/getDate";
import { getStatus } from "../../../order/utils/getStatus";
import useListSaleOrderByProduct from "../../hooks/useListSaleOrderByProduct";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import useAuth from "../../../auth/hooks/useAuth";

interface ListSaleOrderByProductProps {
  productId: string;
}

const ListSaleOrderByProduct: FC<ListSaleOrderByProductProps> = ({
  productId,
}) => {
  const { listSaleOrderByProduct, loadingListProduct } =
    useListSaleOrderByProduct(productId);
  const navigate = useNavigate();
  const { currency } = useAuth();

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<ISaleOrderByProduct[]>
  ) => {
    navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${e.value.saleOrder._id}`);
  };

  const [columns] = useState<DataTableColumn<ISaleOrderByProduct>[]>([
    {
      field: "saleOrder.code",
      header: "Código",
      sortable: true,
    },
    {
      field: "saleOrder.date",
      header: "Fecha",
      sortable: true,
      body: (rowData) => <Tag value={getDate(rowData.saleOrder.date)} />,
    },
    {
      field: "saleOrder.client.fullName",
      header: "Cliente",
      sortable: true,
    },
    {
      field: "saleOrderDetail.quantity",
      header: "Cantidad",
      sortable: true,
    },
    {
      field: "saleOrderDetail.sale_price",
      header: "Precio de venta",
      sortable: true,
      body: (rowData) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.saleOrderDetail.sale_price} ${currency}`}
        />
      ),
    },
    {
      field: "saleOrderDetail.subtotal",
      header: "Subtotal",
      sortable: true,
      body: (rowData) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.saleOrderDetail.subtotal} ${currency}`}
        />
      ),
    },
    {
      field: "saleOrder.status",
      header: "Estado",
      body: (rowData) => {
        const status = getStatus(rowData.saleOrder.status);
        return (
          <Tag
            value={status?.label}
            severity={
              status?.severity as
                | "success"
                | "warning"
                | "danger"
                | "info"
                | undefined
            }
          />
        );
      },
    },
  ]);

  if (loadingListProduct) return <TableSkeleton />;

  return (
    <Card title="Ventas del producto">
      <Table
        columns={columns}
        data={listSaleOrderByProduct}
        emptyMessage="No se registran ventas para este producto."
        size="small"
        onSelectionChange={handleSelectionChange}
      />
    </Card>
  );
};

export default ListSaleOrderByProduct;
