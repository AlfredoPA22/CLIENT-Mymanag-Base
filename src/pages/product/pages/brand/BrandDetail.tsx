import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import TextLink from "../../../../components/TextLink/TextLink";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import Table from "../../../../components/datatable/Table";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { IBrand } from "../../../../utils/interfaces/Brand";
import { IProduct } from "../../../../utils/interfaces/Product";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { getStatus } from "../../../order/utils/getStatus";
import useProductListWithParams from "../../hooks/useProductListWithParams";
import useAuth from "../../../auth/hooks/useAuth";
import { formatAmount } from "../../../../utils/currency";

interface BrandDetailProps {
  brand: IBrand;
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

const BrandDetail: FC<BrandDetailProps> = ({ brand }) => {
  const { currency } = useAuth();
  const { listProductWithParams, loadingListProductWithParams } =
    useProductListWithParams({
      brandId: brand._id,
      categoryId: "",
      warehouseId: "",
    });

  const statusBodyTemplate = (rowData: IProduct) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return <Tag severity={severity as "danger" | "success"}>{label}</Tag>;
    }
    return null;
  };

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
      field: "category.name",
      header: "Categoria",
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
      header: "Stock",
      sortable: true,
      style: { width: "10%", textAlign: "center" },
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "10%", textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProductWithParams) {
    return <LoadingSpinner />;
  }

  const products: IProduct[] = listProductWithParams ?? [];
  const totalStock = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const avgPrice = products.length > 0
    ? products.reduce((acc, p) => acc + (p.sale_price ?? 0), 0) / products.length
    : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Encabezado + resumen, en una sola fila en pantallas grandes ── */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
        <div className={`${statCardBase} border-t-indigo-400 lg:flex-[1.3] flex-row items-center`}>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg font-bold shrink-0">
            {getInitials(brand.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-gray-800 break-words">{brand.name}</h2>
            <p className="text-sm text-gray-500 mt-1 break-words">
              {brand.description || "Sin descripción"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-3 lg:flex-[2]">
          <div className={`${statCardBase} border-t-teal-400 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <i className="pi pi-box text-teal-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{products.length}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Productos</p>
            </div>
          </div>

          <div className={`${statCardBase} border-t-sky-400 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
              <i className="pi pi-inbox text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalStock}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Stock total</p>
            </div>
          </div>

          <div className={`${statCardBase} border-t-[#A0C82E] col-span-2 sm:col-span-1 lg:flex-1`}>
            <div className="w-10 h-10 rounded-xl bg-[#A0C82E]/10 flex items-center justify-center">
              <i className="pi pi-dollar text-[#A0C82E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatAmount(avgPrice)}
                <span className="text-sm font-medium text-slate-400 ml-1">{currency}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Precio promedio</p>
            </div>
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
          {products.map((product: IProduct) => {
            const status = getStatus(product.status);
            return (
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
                    {product.category?.name && (
                      <p className="text-xs text-gray-500 break-words">{product.category.name}</p>
                    )}
                  </div>
                  {status && (
                    <Tag severity={status.severity as "danger" | "success"} className="shrink-0">
                      {status.label}
                    </Tag>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="font-semibold text-blue-600">
                    {formatAmount(product.sale_price)} {currency}
                  </span>
                  <span className={`font-semibold text-xs ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Desktop: tabla ─────────────────────────────────── */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={products}
            emptyMessage="Sin productos."
            size="small"
            tableHeader={renderFilterInput}
            dataFilters={filters}
            editMode="row"
          />
        </div>
      </Card>
    </div>
  );
};

export default BrandDetail;
