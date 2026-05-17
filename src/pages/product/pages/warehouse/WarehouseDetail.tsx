import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import TextLink from "../../../../components/TextLink/TextLink";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { IProduct } from "../../../../utils/interfaces/Product";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import { getStatus } from "../../../order/utils/getStatus";
import useProductListWithParams from "../../hooks/useProductListWithParams";
import useAuth from "../../../auth/hooks/useAuth";

interface WarehouseDetailProps {
  warehouse: IWarehouse;
}

const WarehouseDetail: FC<WarehouseDetailProps> = ({ warehouse }) => {
  const { currency } = useAuth();
  const { listProductWithParams, loadingListProductWithParams } =
    useProductListWithParams({
      brandId: "",
      categoryId: "",
      warehouseId: warehouse._id,
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
      field: "brand.name",
      header: "Marca",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "sale_price",
      header: "Precio de venta",
      sortable: true,
      style: { width: "10%" },
      body: (rowData: IProduct) => (
        <LabelInput className="justify-center" label={`${rowData.sale_price} ${currency}`} />
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

  return (
    <div className="flex flex-col gap-2">
      {/* Info card */}
      <Card className="bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 break-words">{warehouse.name}</h2>
        <p className="text-gray-600 mt-2 break-words">{warehouse.description}</p>
      </Card>

      {listProductWithParams && (
        <Card className="bg-white shadow-lg rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Productos Asociados ({listProductWithParams.length})
            </h3>
          </div>

          {/* ── Mobile: cards ─────────────────────────────────── */}
          <div className="flex flex-col gap-2 md:hidden">
            {listProductWithParams.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">Sin productos.</p>
            )}
            {listProductWithParams.map((product: IProduct) => {
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
                      {product.brand?.name && (
                        <p className="text-xs text-gray-500 break-words">{product.brand.name}</p>
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
                      {currency} {product.sale_price.toFixed(2)}
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
              data={listProductWithParams}
              emptyMessage="Sin productos."
              size="small"
              dataFilters={filters}
              tableHeader={renderFilterInput}
              editMode="row"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default WarehouseDetail;
