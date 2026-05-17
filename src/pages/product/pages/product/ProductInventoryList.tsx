import { useQuery } from "@apollo/client";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import TextLink from "../../../../components/TextLink/TextLink";
import { LIST_PRODUCT_INVENTORY_BY_PRODUCT } from "../../../../graphql/queries/Product";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProduct } from "../../../../utils/interfaces/Product";
import { IProductInventory } from "../../../../utils/interfaces/ProductInventory";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { getStatus } from "../../../order/utils/getStatus";

interface ProductInventoryListProps {
  product: IProduct;
}

const ProductInventoryList: FC<ProductInventoryListProps> = ({ product }) => {
  const {
    data: { listProductInventoryByProduct: listProductInventory } = [],
    loading: loadingListProductInventory,
    error,
  } = useQuery(LIST_PRODUCT_INVENTORY_BY_PRODUCT, {
    variables: { productId: product._id },
    fetchPolicy: "cache-and-network",
  });

  const statusBodyTemplate = (rowData: IProductInventory) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag severity={severity as "danger" | "success" | "info" | "warning"}>
          {label}
        </Tag>
      );
    }
    return null;
  };

  const purchaseOrderBodyTemplate = (rowData: IProductInventory) => {
    const purchaseOrderDetail = rowData.purchase_order_detail;
    const purchaseOrder = purchaseOrderDetail?.purchase_order;

    if (!purchaseOrder) {
      return <span className="text-gray-400 italic">Sin orden</span>;
    }

    const isApproved = purchaseOrder.status === orderStatus.APROBADO;

    return (
      <TextLink to={`/order/${isApproved ? "viewPurchaseOrder" : "editPurchaseOrder"}/${purchaseOrder._id}`}>
        {purchaseOrder.code}
      </TextLink>
    );
  };

  const [columns] = useState<DataTableColumn<IProductInventory>[]>([
    { field: "purchase_order_detail", header: "orden de compra", sortable: true, style: { width: "15%" }, body: purchaseOrderBodyTemplate },
    { field: "warehouse.name", header: "Almacén", sortable: true, style: { width: "25%" } },
    { field: "quantity", header: "Cantidad", sortable: true, style: { width: "10%" } },
    { field: "available", header: "Disponible", sortable: true, style: { width: "10%" } },
    { field: "reserved", header: "Reservados", sortable: true, style: { width: "10%" } },
    { field: "transferred", header: "Transferidos", sortable: true, style: { width: "10%" } },
    { field: "sold", header: "Vendidos", sortable: true, style: { width: "10%" } },
    { field: "status", header: "Estado", sortable: true, body: statusBodyTemplate, style: { width: "10%", textAlign: "center" } },
  ]);

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Success });
    }
  }, [error]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProductInventory) {
    return <LoadingSpinner />;
  }

  const list: IProductInventory[] = listProductInventory ?? [];

  return (
    <>
      {/* ── Mobile ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:hidden">
        {list.length === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">Sin stock.</p>
        )}
        {list.map((row: IProductInventory) => {
          const status = getStatus(row.status);
          const purchaseOrder = row.purchase_order_detail?.purchase_order;
          const isApproved = purchaseOrder?.status === orderStatus.APROBADO;
          return (
            <div key={row._id} className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white shadow-sm">
              {/* Almacén + estado */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800 break-words flex-1">
                  {row.warehouse?.name ?? "—"}
                </p>
                {status && (
                  <Tag severity={status.severity as "danger" | "success" | "info" | "warning"} className="shrink-0 text-xs">
                    {status.label}
                  </Tag>
                )}
              </div>

              {/* Orden de compra */}
              {purchaseOrder ? (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <i className="pi pi-shopping-cart text-[10px]" />
                  <TextLink to={`/order/${isApproved ? "viewPurchaseOrder" : "editPurchaseOrder"}/${purchaseOrder._id}`}>
                    {purchaseOrder.code}
                  </TextLink>
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic mt-1">Sin orden de compra</p>
              )}

              {/* Grid de cantidades */}
              <div className="grid grid-cols-3 gap-x-2 gap-y-1 mt-2 text-center">
                {[
                  { label: "Cantidad", value: row.quantity },
                  { label: "Disponible", value: row.available },
                  { label: "Reservados", value: row.reserved },
                  { label: "Transferidos", value: row.transferred },
                  { label: "Vendidos", value: row.sold },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg px-2 py-1">
                    <p className="text-[10px] text-gray-400 leading-none">{label}</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{value ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop ───────────────────────────────────────────── */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={list}
          emptyMessage="Sin stock."
          size="small"
          dataFilters={filters}
          tableHeader={renderFilterInput}
        />
      </div>
    </>
  );
};

export default ProductInventoryList;
