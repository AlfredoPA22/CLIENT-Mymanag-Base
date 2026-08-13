import { Tag } from "primereact/tag";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import { ISaleOrderByProduct } from "../../../../utils/interfaces/SaleOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { getDate } from "../../../order/utils/getDate";
import { getStatus } from "../../../order/utils/getStatus";
import useListCustomSaleOrderDetail from "../../hooks/useListCustomSaleOrderDetail";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { useNavigate } from "react-router-dom";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import useAuth from "../../../auth/hooks/useAuth";
import { convertCurrency, formatAmount } from "../../../../utils/currency";
import { useAbility } from "../../../../casl/AbilityContext";

// Ítems de venta que no están respaldados por un Product (mercadería que la
// empresa vendió sin tenerla en su catálogo). Lista plana (una fila por cada
// línea vendida, sin agrupar por nombre) — agrupar por texto libre es
// engañoso: dos nombres casi iguales (mayúsculas, espacios, tildes) se
// verían como "productos" distintos sin que nadie lo note.
const CustomSaleItemsList = () => {
  const { listCustomSaleOrderDetail, loadingListCustomSaleOrderDetail } = useListCustomSaleOrderDetail();
  const navigate = useNavigate();
  const { currency } = useAuth();
  const ability = useAbility();
  const canViewCost = ability.can("read", "ProductCost");

  // Fuera de la sección de ventas, todo monto se muestra convertido a la
  // moneda de la empresa (aunque la nota se haya hecho en su moneda alterna)
  // para no mezclar Bs y $ en un mismo listado.
  const toCompanyAmount = (item: ISaleOrderByProduct, amount: number) =>
    convertCurrency(amount, item.saleOrder.currency ?? currency, currency, item.saleOrder.exchange_rate);

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<ISaleOrderByProduct[]>) => {
    navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${e.value.saleOrder._id}`);
  };

  const columns: DataTableColumn<ISaleOrderByProduct>[] = [
    {
      field: "saleOrderDetail.custom_name", header: "Nombre", sortable: true,
      body: (rowData) => rowData.saleOrderDetail.custom_name ?? "—",
    },
    { field: "saleOrder.code", header: "Código de venta", sortable: true },
    {
      field: "saleOrder.date", header: "Fecha", sortable: true,
      body: (rowData) => <Tag value={getDate(rowData.saleOrder.date)} />,
    },
    { field: "saleOrder.client.fullName", header: "Cliente", sortable: true },
    { field: "saleOrderDetail.quantity", header: "Cantidad", sortable: true },
    {
      field: "saleOrderDetail.sale_price", header: "Precio de venta", sortable: true,
      body: (rowData) => (
        <LabelInput className="justify-center" label={`${formatAmount(toCompanyAmount(rowData, rowData.saleOrderDetail.sale_price))} ${currency}`} />
      ),
    },
    ...(canViewCost ? [{
      field: "saleOrderDetail.custom_cost", header: "Costo", sortable: true,
      body: (rowData: ISaleOrderByProduct) => {
        const cost = rowData.saleOrderDetail.custom_cost;
        if (cost === null || cost === undefined) return <span className="text-gray-400 text-xs">—</span>;
        return <LabelInput className="justify-center" label={`${formatAmount(toCompanyAmount(rowData, cost))} ${currency}`} />;
      },
    } as DataTableColumn<ISaleOrderByProduct>] : []),
    {
      field: "saleOrderDetail.subtotal", header: "Subtotal", sortable: true,
      body: (rowData) => (
        <LabelInput className="justify-center" label={`${formatAmount(toCompanyAmount(rowData, rowData.saleOrderDetail.subtotal))} ${currency}`} />
      ),
    },
    {
      field: "saleOrder.status", header: "Estado",
      body: (rowData) => {
        const status = getStatus(rowData.saleOrder.status);
        return <Tag value={status?.label} severity={status?.severity as any} />;
      },
    },
  ];

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);
  const count = listCustomSaleOrderDetail?.length ?? 0;

  if (loadingListCustomSaleOrderDetail) return <TableSkeleton />;

  return (
    <div>
      {/* ── Cabecera mobile ────────────────────────────────────── */}
      <h1 className="text-xl font-bold text-gray-800 mb-3 lg:hidden">
        Fuera de inventario <span className="text-base font-normal text-gray-400">({count})</span>
      </h1>

      {/* ── Mobile: cards ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2 lg:hidden">
        {(!listCustomSaleOrderDetail || listCustomSaleOrderDetail.length === 0) && (
          <p className="text-center text-gray-400 py-6 text-sm">
            No se registran ventas de productos fuera de inventario.
          </p>
        )}
        {listCustomSaleOrderDetail?.map((item: ISaleOrderByProduct) => {
          const status = getStatus(item.saleOrder.status);
          const cost = item.saleOrderDetail.custom_cost;
          return (
            <div
              key={item.saleOrderDetail._id}
              className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer transition-colors duration-150 active:bg-gray-50"
              onClick={() => navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${item.saleOrder._id}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-800 text-sm">
                  {item.saleOrderDetail.custom_name ?? "—"}
                </span>
                <Tag value={status?.label} severity={status?.severity as any} />
              </div>
              <p className="text-sm text-gray-700 truncate">
                {item.saleOrder.code} · {item.saleOrder.client?.fullName}
              </p>
              <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mt-1">
                <span>{getDate(item.saleOrder.date)}</span>
                <span>·</span>
                <span>{item.saleOrderDetail.quantity} uds.</span>
                <span>·</span>
                <span>{formatAmount(toCompanyAmount(item, item.saleOrderDetail.sale_price))} {currency} c/u</span>
                {canViewCost && cost !== null && cost !== undefined && (
                  <>
                    <span>·</span>
                    <span>Costo: {formatAmount(toCompanyAmount(item, cost))} {currency}</span>
                  </>
                )}
              </div>
              <p className="text-sm font-bold text-green-700 mt-1">
                {formatAmount(toCompanyAmount(item, item.saleOrderDetail.subtotal))} {currency}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: tabla ─────────────────────────────────────── */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-left mb-3">{`Fuera de inventario (${count})`}</h1>
        <Table
          columns={columns}
          data={listCustomSaleOrderDetail}
          emptyMessage="No se registran ventas de productos fuera de inventario."
          size="small"
          dataFilters={filters}
          tableHeader={renderFilterInput}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </div>
  );
};

export default CustomSaleItemsList;
