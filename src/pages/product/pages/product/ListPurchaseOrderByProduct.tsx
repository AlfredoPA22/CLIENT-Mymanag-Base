import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { getDate } from "../../../order/utils/getDate";
import { getStatus } from "../../../order/utils/getStatus";
import useListPurchaseOrderByProduct from "../../hooks/useListPurchaseOrderByProduct";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { IPurchaseOrderByProduct } from "../../../../utils/interfaces/PurchaseOrder";

interface ListPurchaseOrderByProductProps {
  productId: string;
}

const ListPurchaseOrderByProduct: FC<ListPurchaseOrderByProductProps> = ({
  productId,
}) => {
  const { listPurchaseOrderByProduct, loadingListProduct } =
    useListPurchaseOrderByProduct(productId);
  const navigate = useNavigate();

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IPurchaseOrderByProduct[]>
  ) => {
    navigate(
      `${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${e.value.purchaseOrder._id}`
    );
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrderByProduct>[]>([
    {
      field: "purchaseOrder.code",
      header: "Código",
      sortable: true,
    },
    {
      field: "purchaseOrder.date",
      header: "Fecha",
      sortable: true,
      body: (rowData) => <Tag value={getDate(rowData.purchaseOrder.date)} />,
    },
    {
      field: "purchaseOrder.provider.name",
      header: "Proveedor",
      sortable: true,
    },
    {
      field: "purchaseOrderDetail.quantity",
      header: "Cantidad",
      sortable: true,
    },
    {
      field: "purchaseOrderDetail.purchase_price",
      header: "Precio de compra",
      sortable: true,
      body: (rowData) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.purchaseOrderDetail.purchase_price} ${currencySymbol}`}
        />
      ),
    },
    {
      field: "purchaseOrderDetail.subtotal",
      header: "Subtotal",
      sortable: true,
      body: (rowData) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.purchaseOrderDetail.subtotal} ${currencySymbol}`}
        />
      ),
    },
    {
      field: "purchaseOrder.status",
      header: "Estado",
      body: (rowData) => {
        const status = getStatus(rowData.purchaseOrder.status);
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
    <Card title="Compras del producto">
      <Table
        columns={columns}
        data={listPurchaseOrderByProduct}
        emptyMessage="No se registran compras para este producto."
        size="small"
        onSelectionChange={handleSelectionChange}
      />
    </Card>
  );
};

export default ListPurchaseOrderByProduct;
