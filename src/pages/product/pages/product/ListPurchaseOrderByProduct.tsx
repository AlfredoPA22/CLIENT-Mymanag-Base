import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { getDate } from "../../../order/utils/getDate";
import { getStatus } from "../../../order/utils/getStatus";
import useListPurchaseOrderByProduct from "../../hooks/useListPurchaseOrderByProduct";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { IPurchaseOrderByProduct } from "../../../../utils/interfaces/PurchaseOrder";
import useAuth from "../../../auth/hooks/useAuth";

interface ListPurchaseOrderByProductProps {
  productId: string;
}

const ListPurchaseOrderByProduct: FC<ListPurchaseOrderByProductProps> = ({ productId }) => {
  const { listPurchaseOrderByProduct, loadingListProduct } = useListPurchaseOrderByProduct(productId);
  const navigate = useNavigate();
  const { currency } = useAuth();

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<IPurchaseOrderByProduct[]>) => {
    navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${e.value.purchaseOrder._id}`);
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrderByProduct>[]>([
    { field: "purchaseOrder.code", header: "Código", sortable: true },
    {
      field: "purchaseOrder.date", header: "Fecha", sortable: true,
      body: (rowData) => <Tag value={getDate(rowData.purchaseOrder.date)} />,
    },
    { field: "purchaseOrder.provider.name", header: "Proveedor", sortable: true },
    { field: "purchaseOrderDetail.quantity", header: "Cantidad", sortable: true },
    {
      field: "purchaseOrderDetail.purchase_price", header: "Precio de compra", sortable: true,
      body: (rowData) => (
        <LabelInput className="justify-center" label={`${rowData.purchaseOrderDetail.purchase_price} ${currency}`} />
      ),
    },
    {
      field: "purchaseOrderDetail.subtotal", header: "Subtotal", sortable: true,
      body: (rowData) => (
        <LabelInput className="justify-center" label={`${rowData.purchaseOrderDetail.subtotal} ${currency}`} />
      ),
    },
    {
      field: "purchaseOrder.status", header: "Estado",
      body: (rowData) => {
        const status = getStatus(rowData.purchaseOrder.status);
        return <Tag value={status?.label} severity={status?.severity as any} />;
      },
    },
  ]);

  if (loadingListProduct) return <TableSkeleton />;

  return (
    <Card title="Compras del producto">
      {/* ── Mobile: cards ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:hidden">
        {(!listPurchaseOrderByProduct || listPurchaseOrderByProduct.length === 0) && (
          <p className="text-center text-gray-400 py-6 text-sm">
            No se registran compras para este producto.
          </p>
        )}
        {listPurchaseOrderByProduct?.map((item: IPurchaseOrderByProduct) => {
          const status = getStatus(item.purchaseOrder.status);
          return (
            <div
              key={item.purchaseOrder._id}
              className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer active:bg-gray-50"
              onClick={() => navigate(`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${item.purchaseOrder._id}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-800 text-sm">{item.purchaseOrder.code}</span>
                <Tag value={status?.label} severity={status?.severity as any} />
              </div>
              <p className="text-sm text-gray-700 truncate">{item.purchaseOrder.provider?.name}</p>
              <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mt-1">
                <span>{getDate(item.purchaseOrder.date)}</span>
                <span>·</span>
                <span>{item.purchaseOrderDetail.quantity} uds.</span>
                <span>·</span>
                <span>{item.purchaseOrderDetail.purchase_price} {currency} c/u</span>
              </div>
              <p className="text-sm font-bold text-blue-700 mt-1">
                {item.purchaseOrderDetail.subtotal} {currency}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: tabla ─────────────────────────────────────── */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={listPurchaseOrderByProduct}
          emptyMessage="No se registran compras para este producto."
          size="small"
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </Card>
  );
};

export default ListPurchaseOrderByProduct;
