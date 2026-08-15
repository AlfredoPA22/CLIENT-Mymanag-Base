import { Card } from "primereact/card";
import { FC, useState } from "react";
import TextLink from "../../../../components/TextLink/TextLink";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { IProduct } from "../../../../utils/interfaces/Product";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import useProductListWithParams from "../../hooks/useProductListWithParams";
import useAuth from "../../../auth/hooks/useAuth";
import { formatAmount } from "../../../../utils/currency";

interface WarehouseDetailProps {
  warehouse: IWarehouse;
}

const statCardBase =
  "bg-white rounded-2xl border border-slate-100 border-t-4 shadow-sm p-4 flex flex-col gap-3";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const WarehouseDetail: FC<WarehouseDetailProps> = ({ warehouse }) => {
  const { currency } = useAuth();
  const { listProductWithParams, loadingListProductWithParams } =
    useProductListWithParams({
      brandId: "",
      categoryId: "",
      warehouseId: warehouse._id,
    });

  const [columns] = useState<DataTableColumn<IProduct>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
      style: { width: "10%" },
      body: (rowData: IProduct) => (
        <TextLink to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${rowData._id}`}>
          {rowData.code}
        </TextLink>
      ),
    },
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      style: { width: "20%" },
    },
    {
      field: "brand.name",
      header: "Marca",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "sale_price",
      header: "Precio de venta",
      sortable: true,
      style: { width: "10%", textAlign: "right" },
      body: (rowData: IProduct) => (
        <span className="font-semibold text-gray-800">
          {formatAmount(rowData.sale_price)} {currency}
        </span>
      ),
    },
    {
      field: "stock",
      header: "Stock en este almacén",
      sortable: true,
      style: { width: "15%", textAlign: "center" },
      body: (rowData: IProduct) => {
        const reserved = rowData.stock - (rowData.available_stock ?? 0);
        return (
          <div className="flex flex-col items-center">
            <span className={`font-semibold ${rowData.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {rowData.stock}
            </span>
            {reserved > 0 && (
              <span className="text-xs text-amber-600">{reserved} reservado</span>
            )}
          </div>
        );
      },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProductWithParams) {
    return <LoadingSpinner />;
  }

  const products: IProduct[] = listProductWithParams ?? [];
  const totalStock = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  // "Sin stock aquí" = nada vendible ahora mismo, aunque haya algo
  // reservado (físicamente presente pero ya comprometido con otra venta).
  const outOfStockCount = products.filter((p) => (p.available_stock ?? 0) <= 0).length;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Encabezado del almacén ─────────────────────────────── */}
      <Card className="shadow-lg rounded-2xl border-none">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold shrink-0">
            {getInitials(warehouse.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-800 break-words">{warehouse.name}</h2>
            <p className="text-sm text-gray-500 mt-1 break-words">
              {warehouse.description || "Sin descripción"}
            </p>
          </div>
        </div>
      </Card>

      {/* ── Resumen ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className={`${statCardBase} border-t-teal-400`}>
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <i className="pi pi-box text-teal-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{products.length}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Productos</p>
          </div>
        </div>

        <div className={`${statCardBase} border-t-sky-400`}>
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
            <i className="pi pi-inbox text-sky-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalStock}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Stock total</p>
          </div>
        </div>

        <div className={`${statCardBase} ${outOfStockCount > 0 ? "border-t-red-400" : "border-t-[#A0C82E]"} col-span-2 sm:col-span-1`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${outOfStockCount > 0 ? "bg-red-50" : "bg-[#A0C82E]/10"}`}>
            <i className={`pi pi-exclamation-triangle ${outOfStockCount > 0 ? "text-red-500" : "text-[#A0C82E]"}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{outOfStockCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Sin stock aquí</p>
          </div>
        </div>
      </div>

      {/* ── Productos asociados ────────────────────────────────── */}
      <Card className="bg-white shadow-lg rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Productos asociados
        </h3>

        {/* ── Mobile: cards ─────────────────────────────────── */}
        <div className="flex flex-col gap-2 md:hidden">
          {products.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">Sin productos.</p>
          )}
          {products.map((product: IProduct) => (
              <div
                key={product._id}
                className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 overflow-hidden flex-1">
                    <TextLink
                      to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${product._id}`}
                    >
                      <span className="text-xs font-medium">{product.code}</span>
                    </TextLink>
                    <p className="font-semibold text-gray-800 text-sm break-words mt-0.5">{product.name}</p>
                    {product.brand?.name && (
                      <p className="text-xs text-gray-500 break-words">{product.brand.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="font-semibold text-blue-600">
                    {formatAmount(product.sale_price)} {currency}
                  </span>
                  <span className={`font-semibold text-xs ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                    Stock aquí: {product.stock}
                    {product.stock - (product.available_stock ?? 0) > 0 &&
                      ` (${product.stock - (product.available_stock ?? 0)} reservado)`}
                  </span>
                </div>
              </div>
          ))}
        </div>

        {/* ── Desktop: tabla ─────────────────────────────────── */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={products}
            emptyMessage="Sin productos."
            size="small"
            dataFilters={filters}
            tableHeader={renderFilterInput}
            editMode="row"
          />
        </div>
      </Card>
    </div>
  );
};

export default WarehouseDetail;
