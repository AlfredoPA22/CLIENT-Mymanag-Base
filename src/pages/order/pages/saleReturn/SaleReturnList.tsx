import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextLink from "../../../../components/TextLink/TextLink";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import {
  LIST_SALE_RETURN,
  LIST_SALE_RETURN_DETAIL,
} from "../../../../graphql/queries/SaleReturn";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import useAuth from "../../../auth/hooks/useAuth";
import { getDate } from "../../utils/getDate";

interface ISaleReturn {
  _id: string;
  code: string;
  date: string;
  reason: string;
  total: number;
  sale_order: { _id: string; code: string; client: { fullName: string } };
  created_by: { user_name: string };
}

interface ISaleReturnDetail {
  _id: string;
  product: { _id: string; code: string; name: string };
  quantity: number;
  sale_price: number;
  subtotal: number;
}

const SaleReturnList = () => {
  const navigate = useNavigate();
  const { currency } = useAuth();
  const MOBILE_PAGE_SIZE = 20;
  const [mobilePage, setMobilePage] = useState(1);
  const [selectedReturn, setSelectedReturn] = useState<ISaleReturn | null>(null);

  const { data, loading } = useQuery(LIST_SALE_RETURN, {
    fetchPolicy: "network-only",
  });

  const { data: detailData, loading: loadingDetail } = useQuery(LIST_SALE_RETURN_DETAIL, {
    variables: { saleReturnId: selectedReturn?._id ?? "" },
    skip: !selectedReturn,
    fetchPolicy: "network-only",
  });

  const dateBodyTemplate = (rowData: ISaleReturn) =>
    rowData.date ? <Tag severity="secondary">{getDate(rowData.date)}</Tag> : null;

  const clientBodyTemplate = (rowData: ISaleReturn) =>
    rowData.sale_order?.client?.fullName ?? "-";

  const saleOrderBodyTemplate = (rowData: ISaleReturn) => (
    <TextLink
      to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${rowData.sale_order?._id}`}
      stopPropagation
    >
      {rowData.sale_order?.code ?? "-"}
    </TextLink>
  );

  const totalBodyTemplate = (rowData: ISaleReturn) => (
    <LabelInput className="justify-center" label={`${rowData.total} ${currency}`} />
  );

  const [columns] = useState<DataTableColumn<ISaleReturn>[]>([
    { field: "code", header: "Código devolución", sortable: true },
    { field: "date", header: "Fecha", sortable: true, body: dateBodyTemplate },
    { field: "sale_order.code", header: "Venta original", sortable: false, body: saleOrderBodyTemplate },
    { field: "sale_order.client.fullName", header: "Cliente", sortable: false, body: clientBodyTemplate },
    { field: "created_by.user_name", header: "Registrado por", sortable: true },
    {
      field: "total", header: "Total devuelto", sortable: true,
      style: { textAlign: "center" },
      body: totalBodyTemplate,
    },
    { field: "reason", header: "Motivo", sortable: false },
  ]);

  const detailColumns: DataTableColumn<ISaleReturnDetail>[] = [
    {
      field: "product.code", header: "Código",
      body: (row: ISaleReturnDetail) => (
        <TextLink to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${row.product._id}`}>
          {row.product?.code}
        </TextLink>
      ),
    },
    { field: "product.name", header: "Producto" },
    { field: "quantity", header: "Cantidad", style: { textAlign: "center" } },
    {
      field: "sale_price", header: "Precio unitario", style: { textAlign: "center" },
      body: (row: ISaleReturnDetail) => `${row.sale_price} ${currency}`,
    },
    {
      field: "subtotal", header: "Subtotal", style: { textAlign: "center" },
      body: (row: ISaleReturnDetail) => `${row.subtotal} ${currency}`,
    },
  ];

  if (loading) return <LoadingSpinner />;

  const list: ISaleReturn[] = data?.listSaleReturn ?? [];

  const tableHeaderTemplate = () => (
    <div className="flex justify-between items-center m-2 px-5">
      <h1 className="text-2xl font-bold">{`Devoluciones (${list.length})`}</h1>
      <Button
        label="Volver a ventas"
        icon="pi pi-arrow-left"
        className="p-button-outlined"
        onClick={() => navigate(ROUTES_MOCK.SALE_ORDERS)}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ── Mobile ─────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{`Devoluciones (${list.length})`}</h1>
          <Button
            label="Volver"
            icon="pi pi-arrow-left"
            size="small"
            className="p-button-outlined"
            onClick={() => navigate(ROUTES_MOCK.SALE_ORDERS)}
          />
        </div>

        {list.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin devoluciones registradas.</p>
        )}

        {list.slice(0, mobilePage * MOBILE_PAGE_SIZE).map((item) => (
          <div
            key={item._id}
            className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer"
            onClick={() => setSelectedReturn(item)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-800 text-sm break-words">{item.code}</p>
                {item.sale_order?.client?.fullName && (
                  <p className="text-xs text-gray-500 break-words">{item.sale_order.client.fullName}</p>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                {item.date && (
                  <Tag severity="secondary" className="text-[10px]">{getDate(item.date)}</Tag>
                )}
                <span className="text-sm font-semibold text-green-600">
                  {item.total} {currency}
                </span>
              </div>
            </div>

            <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-gray-500">
              {item.sale_order?.code && (
                <span className="flex items-center gap-1">
                  <i className="pi pi-file text-[10px]" />
                  <TextLink
                    to={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${item.sale_order._id}`}
                    stopPropagation
                  >
                    {item.sale_order.code}
                  </TextLink>
                </span>
              )}
              {item.created_by?.user_name && (
                <span className="flex items-center gap-1">
                  <i className="pi pi-user text-[10px]" />
                  {item.created_by.user_name}
                </span>
              )}
              {item.reason && (
                <span className="flex items-center gap-1">
                  <i className="pi pi-info-circle text-[10px]" />
                  <span className="break-words">{item.reason}</span>
                </span>
              )}
            </div>
          </div>
        ))}
        {mobilePage * MOBILE_PAGE_SIZE < list.length && (
          <Button
            label={`Cargar más (${list.length - mobilePage * MOBILE_PAGE_SIZE} restantes)`}
            icon="pi pi-chevron-down"
            severity="secondary"
            outlined
            className="w-full"
            onClick={() => setMobilePage((p) => p + 1)}
          />
        )}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <Card className="py-2 hidden md:block" header={tableHeaderTemplate}>
        <Table
          columns={columns}
          data={list}
          emptyMessage="Sin devoluciones registradas."
          size="small"
          onSelectionChange={(e: any) => setSelectedReturn(e.value)}
        />
      </Card>

      {/* ── Detail Dialog ───────────────────────────────────── */}
      <Dialog
        header={`Detalle de devolución — ${selectedReturn?.code ?? ""}`}
        visible={!!selectedReturn}
        onHide={() => setSelectedReturn(null)}
        className="w-[95vw] md:w-[650px]"
        footer={
          <Button
            label="Cerrar"
            severity="secondary"
            outlined
            onClick={() => setSelectedReturn(null)}
          />
        }
      >
        {loadingDetail ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col gap-3">
            {/* Info summary */}
            <div className="flex flex-col gap-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <span><strong>Venta:</strong> {selectedReturn?.sale_order?.code}</span>
              <span><strong>Cliente:</strong> {selectedReturn?.sale_order?.client?.fullName}</span>
              <span><strong>Motivo:</strong> {selectedReturn?.reason}</span>
            </div>

            {/* ── Mobile: product cards ───────────────────── */}
            <div className="flex flex-col gap-2 md:hidden">
              {(detailData?.listSaleReturnDetail ?? []).length === 0 && (
                <p className="text-center text-gray-400 py-4 text-sm">Sin productos.</p>
              )}
              {(detailData?.listSaleReturnDetail ?? []).map((row: ISaleReturnDetail) => (
                <div
                  key={row._id}
                  className="border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm"
                >
                  <TextLink to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${row.product._id}`}>
                    <span className="text-xs font-mono">{row.product?.code}</span>
                  </TextLink>
                  <p className="text-sm text-gray-700 break-words leading-snug mt-0.5">{row.product?.name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-500">
                      {row.quantity} × {row.sale_price} {currency}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {row.subtotal} {currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop: table ──────────────────────────── */}
            <div className="hidden md:block">
              <Table
                columns={detailColumns}
                data={detailData?.listSaleReturnDetail ?? []}
                emptyMessage="Sin productos."
                size="small"
              />
            </div>

            <div className="flex justify-end text-base font-semibold text-green-600">
              Total devuelto: {selectedReturn?.total} {currency}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default SaleReturnList;
