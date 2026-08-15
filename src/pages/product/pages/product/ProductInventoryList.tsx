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
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";

interface ProductInventoryListProps {
  product: IProduct;
}

// Movimientos posibles de un lote, además de lo que sigue Disponible — solo
// se muestran los que tienen algo (la mayoría de los lotes solo tocan uno).
const MOVEMENT_FIELDS: { key: "reserved" | "transferred" | "sold"; label: string; cls: string }[] = [
  { key: "reserved", label: "Reservado", cls: "text-amber-700 bg-amber-50" },
  { key: "transferred", label: "Transferido", cls: "text-purple-700 bg-purple-50" },
  { key: "sold", label: "Vendido", cls: "text-blue-700 bg-blue-50" },
];

const MovementChips = ({ rowData }: { rowData: IProductInventory }) => {
  const items = MOVEMENT_FIELDS.filter((m) => (rowData[m.key] ?? 0) > 0);
  if (items.length === 0) {
    return <span className="text-gray-300 text-xs">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((m) => (
        <span key={m.key} className={`text-[10px] font-medium rounded-full px-2 py-0.5 whitespace-nowrap ${m.cls}`}>
          {m.label}: {rowData[m.key]}
        </span>
      ))}
    </div>
  );
};

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

  const availableBodyTemplate = (rowData: IProductInventory) => (
    <span className={`font-bold ${rowData.available > 0 ? "text-emerald-600" : "text-gray-300"}`}>
      {rowData.available}
    </span>
  );

  // "Sin orden" no explicaba nada — ese lote no vino de una compra, vino de
  // una transferencia desde otro almacén (ver createDetail en
  // productTransfer.service.ts, que crea el lote destino sin purchase_order_detail).
  const originBodyTemplate = (rowData: IProductInventory) => {
    const purchaseOrderDetail = rowData.purchase_order_detail;
    const purchaseOrder = purchaseOrderDetail?.purchase_order;

    if (!purchaseOrder) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full px-2 py-0.5 whitespace-nowrap">
          <i className="pi pi-arrow-right-arrow-left text-[10px]" /> Transferencia
        </span>
      );
    }

    const isApproved = purchaseOrder.status === orderStatus.APROBADO;

    return (
      <TextLink
        to={
          isApproved
            ? `${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${purchaseOrder._id}`
            : `${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.EDIT_PURCHASE_ORDER}/${purchaseOrder._id}`
        }
      >
        {purchaseOrder.code}
      </TextLink>
    );
  };

  const [columns] = useState<DataTableColumn<IProductInventory>[]>([
    { field: "purchase_order_detail", header: "Origen", sortable: true, style: { width: "18%" }, body: originBodyTemplate },
    { field: "warehouse.name", header: "Almacén", sortable: true, style: { width: "20%" } },
    { field: "quantity", header: "Cantidad", sortable: true, style: { width: "10%", textAlign: "center" } },
    { field: "available", header: "Disponible", sortable: true, style: { width: "12%", textAlign: "center" }, body: availableBodyTemplate },
    { field: "reserved", header: "Movimientos", style: { width: "25%" }, body: (r: IProductInventory) => <MovementChips rowData={r} /> },
    { field: "status", header: "Estado", sortable: true, body: statusBodyTemplate, style: { width: "15%", textAlign: "center" } },
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

  const totals = list.reduce(
    (acc, row) => ({
      available: acc.available + (row.available ?? 0),
      reserved: acc.reserved + (row.reserved ?? 0),
    }),
    { available: 0, reserved: 0 }
  );

  return (
    <>
      <p className="text-xs text-gray-500 mb-3">
        Cada fila es un lote de stock recibido (una compra o una transferencia). La{" "}
        <strong>Cantidad</strong> del lote se reparte entre lo que queda{" "}
        <strong>Disponible</strong> y lo que ya se movió (reservado, transferido o vendido).
      </p>

      {/* Reconcilia con el "Stock" que se ve en la lista de productos — ese
          número no baja apenas algo se reserva (solo al aprobar la venta),
          así que suele ser Disponible + Reservado, no solo Disponible. */}
      {list.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs text-gray-600">
          <span>
            <strong className="text-emerald-600">{totals.available}</strong> disponible
          </span>
          <span className="text-gray-300">+</span>
          <span>
            <strong className="text-amber-700">{totals.reserved}</strong> reservado
          </span>
          <span className="text-gray-300">=</span>
          <span>
            <strong className="text-gray-800">{product.stock}</strong> en stock del producto
          </span>
        </div>
      )}

      {/* ── Mobile ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 lg:hidden">
        {list.length === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">Sin stock.</p>
        )}
        {list.map((row: IProductInventory) => {
          const status = getStatus(row.status);
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

              {/* Origen */}
              <div className="mt-1">{originBodyTemplate(row)}</div>

              {/* Cantidad / Disponible */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-center">
                <div className="bg-gray-50 rounded-lg px-2 py-1">
                  <p className="text-[10px] text-gray-400 leading-none">Cantidad</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">{row.quantity ?? 0}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-2 py-1">
                  <p className="text-[10px] text-gray-400 leading-none">Disponible</p>
                  <p className={`text-sm font-bold mt-0.5 ${row.available > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                    {row.available ?? 0}
                  </p>
                </div>
              </div>

              {/* Movimientos */}
              <div className="mt-2">
                <MovementChips rowData={row} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop ───────────────────────────────────────────── */}
      <div className="hidden lg:block">
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
