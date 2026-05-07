import { useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextLink from "../../../../components/TextLink/TextLink";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import SectionHeader from "../../../../components/sectionHeader/SectionHeader";
import {
  LIST_SALE_RETURN,
  LIST_SALE_RETURN_DETAIL,
} from "../../../../graphql/queries/SaleReturn";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import useAuth from "../../../auth/hooks/useAuth";
import { getDate } from "../../utils/getDate";
import { Dialog } from "primereact/dialog";

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

  return (
    <div className="flex flex-col gap-3">
      <Card className="py-2">
        <SectionHeader
          title="Devoluciones"
          subtitle="Registro de todas las devoluciones de ventas procesadas."
          actions={
            <Button
              label="Volver a ventas"
              icon="pi pi-arrow-left"
              className="p-button-outlined"
              onClick={() => navigate(ROUTES_MOCK.SALE_ORDERS)}
            />
          }
        />
        <Table
          columns={columns}
          data={data?.listSaleReturn ?? []}
          emptyMessage="Sin devoluciones registradas."
          size="small"
          onSelectionChange={(e: any) => setSelectedReturn(e.value)}
        />
      </Card>

      <Dialog
        header={`Detalle de devolución — ${selectedReturn?.code ?? ""}`}
        visible={!!selectedReturn}
        onHide={() => setSelectedReturn(null)}
        style={{ width: "650px" }}
        breakpoints={{ "768px": "95vw" }}
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <span><strong>Venta:</strong> {selectedReturn?.sale_order?.code}</span>
              <span><strong>Cliente:</strong> {selectedReturn?.sale_order?.client?.fullName}</span>
              <span><strong>Motivo:</strong> {selectedReturn?.reason}</span>
            </div>
            <Table
              columns={detailColumns}
              data={detailData?.listSaleReturnDetail ?? []}
              emptyMessage="Sin productos."
              size="small"
            />
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
