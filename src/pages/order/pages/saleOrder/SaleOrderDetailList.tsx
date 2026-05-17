import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { numberEditor } from "../../../../components/numberEditor/numberEditor";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import {
  DELETE_PRODUCT_TO_SALE_ORDER_DETAIL,
  UPDATE_SALE_ORDER_DETAIL,
} from "../../../../graphql/mutations/SaleOrderDetail";
import { FIND_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { LIST_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { setSaleOrder } from "../../../../redux/slices/saleOrderSlice";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { ISaleOrderDetail } from "../../../../utils/interfaces/SaleOrderDetail";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import SerialToDetail from "./SerialToDetail";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import useAuth from "../../../auth/hooks/useAuth";
import TextLink from "../../../../components/TextLink/TextLink";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";

interface SaleOrderDetailListProps {
  saleOrderId: string;
  editMode?: boolean;
}

interface MobileEditState {
  _id: string;
  sale_price: number | string;
  quantity: number | string;
  discount_type: string;
  discount_value: number | string;
}

const SaleOrderDetailList: FC<SaleOrderDetailListProps> = ({
  saleOrderId,
  editMode = true,
}) => {
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [currentSaleOrderDetail, setCurrentSaleOrderDetail] =
    useState<ISaleOrderDetail>();
  const [mobileEditVisible, setMobileEditVisible] = useState(false);
  const [mobileEditData, setMobileEditData] = useState<MobileEditState | null>(null);

  const client = useApolloClient();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [deleteProductToSaleOrderDetail] = useMutation(
    DELETE_PRODUCT_TO_SALE_ORDER_DETAIL,
    {
      refetchQueries: [
        { query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } },
        { query: FIND_SALE_ORDER, variables: { saleOrderId } },
      ],
    }
  );

  const [updateSaleOrderDetail] = useMutation(UPDATE_SALE_ORDER_DETAIL, {
    refetchQueries: [
      { query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } },
      { query: FIND_SALE_ORDER, variables: { saleOrderId } },
    ],
  });

  const {
    data: { listSaleOrderDetail: listSaleOrderDetail } = [],
    loading: loadingListSaleOrderDetail,
    error,
  } = useQuery(LIST_SALE_ORDER_DETAIL, {
    variables: { saleOrderId },
    fetchPolicy: "network-only",
  });

  const discountTypeOptions = [
    { label: "Sin desc.", value: "" },
    { label: "Fijo", value: "FIJO" },
    { label: "Porcentual", value: "PORCENTUAL" },
  ];

  const handleDeleteProduct = async (saleOrderDetailId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProductToSaleOrderDetail({
        variables: { saleOrderDetailId },
      });
      const data2 = await client.query({
        query: FIND_SALE_ORDER,
        variables: { saleOrderId },
        fetchPolicy: "network-only",
      });
      if (data.deleteProductToSaleOrderDetail.success && data2.data) {
        showToast({ detail: "Producto eliminado de la venta.", severity: ToastSeverity.Success });
        dispatch(setSaleOrder(data2.data.findSaleOrder));
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleMobileEdit = (detail: ISaleOrderDetail) => {
    setMobileEditData({
      _id: detail._id,
      sale_price: detail.sale_price,
      quantity: detail.quantity,
      discount_type: detail.discount_type || "",
      discount_value: detail.discount_value ?? "",
    });
    setMobileEditVisible(true);
  };

  const handleMobileEditSave = async () => {
    if (!mobileEditData) return;
    if (!mobileEditData.sale_price || Number(mobileEditData.sale_price) <= 0 ||
        !mobileEditData.quantity || Number(mobileEditData.quantity) <= 0) {
      showToast({ detail: "El precio y la cantidad son obligatorios.", severity: ToastSeverity.Error });
      return;
    }
    try {
      dispatch(setIsBlocked(true));
      const { data } = await updateSaleOrderDetail({
        variables: {
          saleOrderDetailId: mobileEditData._id,
          sale_price: Number(mobileEditData.sale_price),
          quantity: Number(mobileEditData.quantity),
          discount_type: mobileEditData.discount_type || null,
          discount_value: mobileEditData.discount_type && mobileEditData.discount_value !== ""
            ? Number(mobileEditData.discount_value)
            : null,
        },
      });
      const data2 = await client.query({
        query: FIND_SALE_ORDER,
        variables: { saleOrderId },
        fetchPolicy: "network-only",
      });
      if (data && data2.data) {
        dispatch(setSaleOrder(data2.data.findSaleOrder));
        showToast({ detail: "Detalle actualizado.", severity: ToastSeverity.Success });
        setMobileEditVisible(false);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: ISaleOrderDetail) => {
    return (
      <div className="flex justify-center gap-2">
        {rowData.product.stock_type === stockType.SERIALIZADO && (
          <Button
            tooltip={editMode ? "Agregar seriales" : "Ver seriales"}
            icon="pi pi-cart-plus"
            raised
            severity="success"
            aria-label="Seriales"
            onClick={() => {
              setCurrentSaleOrderDetail(rowData);
              setVisibleForm(true);
            }}
          />
        )}
        {editMode && (
          <Button
            tooltip="Eliminar detalle"
            icon="pi pi-trash"
            raised
            severity="danger"
            aria-label="Eliminar"
            onClick={() => handleDeleteProduct(rowData._id)}
          />
        )}
      </div>
    );
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
      if (e.newData.sale_price <= 0 || e.newData.quantity <= 0) {
        showToast({
          detail: "El precio y la cantidad son obligatorios.",
          severity: ToastSeverity.Error,
        });
      } else {
        const { data } = await updateSaleOrderDetail({
          variables: {
            saleOrderDetailId: e.newData._id,
            sale_price: e.newData.sale_price,
            quantity: e.newData.quantity,
            discount_type: (() => {
              const v = e.newData.discount_type;
              const s = typeof v === "object" ? (v as any)?.value : v;
              return s || null;
            })(),
            discount_value: (() => {
              const v = e.newData.discount_type;
              const type = typeof v === "object" ? (v as any)?.value : v;
              if (!type) return null;
              return e.newData.discount_value ? Number(e.newData.discount_value) : null;
            })(),
          },
        });

        const data2 = await client.query({
          query: FIND_SALE_ORDER,
          variables: { saleOrderId },
          fetchPolicy: "network-only",
        });

        if (data && data2.data) {
          dispatch(setSaleOrder(data2.data.findSaleOrder));
          showToast({ detail: "Detalle actualizado.", severity: ToastSeverity.Success });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const [columns] = useState<DataTableColumn<ISaleOrderDetail>[]>([
    {
      field: "product.code",
      header: "Código",
      sortable: true,
      style: { width: "8%" },
      body: (rowData: ISaleOrderDetail) => (
        <TextLink to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${rowData.product._id}`}>
          {rowData.product.code}
        </TextLink>
      ),
    },
    {
      field: "product.name",
      header: "Producto",
      sortable: true,
      style: { width: "22%" },
    },
    {
      field: "sale_price",
      header: "Precio unit.",
      sortable: true,
      style: { width: "12%" },
      body: (rowData: ISaleOrderDetail) => (
        <LabelInput className="justify-center" label={`${rowData.sale_price} ${currency}`} />
      ),
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options, true),
    },
    {
      field: "quantity",
      header: "Cantidad",
      sortable: true,
      style: { textAlign: "center", width: "8%" },
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "discount_type",
      header: "Tipo desc.",
      sortable: false,
      style: { width: "10%" },
      body: (rowData: ISaleOrderDetail) => {
        if (!rowData.discount_type || !rowData.discount_value)
          return <span className="text-gray-400 text-xs">—</span>;
        if (rowData.discount_type === "PORCENTUAL")
          return <span className="text-xs text-orange-600">{rowData.discount_value}%</span>;
        return <span className="text-xs text-orange-600">{rowData.discount_value} {currency}</span>;
      },
      fieldEditor: (options: ColumnEditorOptions) => (
        <Dropdown
          value={options.value ?? ""}
          options={discountTypeOptions}
          optionLabel="label"
          optionValue="value"
          onChange={(e) => options.editorCallback!(e.value)}
          className="w-full text-sm"
        />
      ),
    },
    {
      field: "discount_value",
      header: "Descuento",
      sortable: false,
      style: { textAlign: "center", width: "10%" },
      body: (rowData: ISaleOrderDetail) => {
        const amt = rowData.discount_amount ?? 0;
        if (amt === 0) return <span className="text-gray-400 text-xs">—</span>;
        return <span className="text-xs text-orange-500">-{amt} {currency}</span>;
      },
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options, true),
    },
    {
      field: "subtotal",
      header: "Subtotal",
      sortable: true,
      style: { textAlign: "center", width: "12%" },
      body: (rowData: ISaleOrderDetail) => (
        <LabelInput className="justify-center" label={`${rowData.subtotal} ${currency}`} />
      ),
    },
    {
      field: "serials",
      header: "Seriales",
      sortable: true,
      style: { textAlign: "center", width: "8%" },
      body: (rowData: ISaleOrderDetail) => {
        if (rowData.product.stock_type === stockType.SERIALIZADO) {
          return <span>{rowData.serials}</span>;
        }
        return <>—</>;
      },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  if (loadingListSaleOrderDetail) {
    return <TableSkeleton />;
  }

  return (
    <Card
      title={`Productos de la venta (${listSaleOrderDetail ? listSaleOrderDetail.length : ""})`}
    >
      {/* ── Vista mobile: cards ─────────────────────────────────── */}
      <div className="block md:hidden space-y-3">
        {(!listSaleOrderDetail || listSaleOrderDetail.length === 0) && (
          <p className="text-center text-gray-400 py-6 text-sm">Venta sin productos.</p>
        )}
        {listSaleOrderDetail?.map((detail: ISaleOrderDetail) => (
          <div
            key={detail._id}
            className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm"
          >
            {/* Cabecera: código + nombre + subtotal */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <TextLink
                  to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${detail.product._id}`}
                >
                  <span className="text-xs font-mono text-blue-600 hover:underline">
                    {detail.product.code}
                  </span>
                </TextLink>
                <p className="font-semibold text-gray-800 text-sm leading-tight truncate">
                  {detail.product.name}
                </p>
              </div>
              <span className="text-base font-bold text-green-700 whitespace-nowrap">
                {detail.subtotal} {currency}
              </span>
            </div>

            {/* Detalles: precio × cantidad, descuento */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>
                {detail.sale_price} {currency} × {detail.quantity} uds.
              </span>
              {(detail.discount_amount ?? 0) > 0 && (
                <span className="text-orange-500">
                  Desc: -{detail.discount_amount} {currency}
                  {detail.discount_type === "PORCENTUAL"
                    ? ` (${detail.discount_value}%)`
                    : detail.discount_type === "FIJO"
                    ? " fijo"
                    : ""}
                </span>
              )}
              {detail.product.stock_type === stockType.SERIALIZADO && (
                <span className="text-gray-400">
                  Seriales: <strong className="text-gray-700">{detail.serials}</strong>
                </span>
              )}
            </div>

            {/* Acciones */}
            {(editMode || detail.product.stock_type === stockType.SERIALIZADO) && (
              <div className="flex gap-2 mt-3 justify-end border-t pt-2">
                {detail.product.stock_type === stockType.SERIALIZADO && (
                  <Button
                    tooltip={editMode ? "Agregar seriales" : "Ver seriales"}
                    icon="pi pi-cart-plus"
                    raised
                    severity="success"
                    size="small"
                    onClick={() => {
                      setCurrentSaleOrderDetail(detail);
                      setVisibleForm(true);
                    }}
                  />
                )}
                {editMode && (
                  <>
                    <Button
                      icon="pi pi-pencil"
                      raised
                      severity="info"
                      size="small"
                      tooltip="Editar"
                      onClick={() => handleMobileEdit(detail)}
                    />
                    <Button
                      icon="pi pi-trash"
                      raised
                      severity="danger"
                      size="small"
                      tooltip="Eliminar"
                      onClick={() => handleDeleteProduct(detail._id)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Vista desktop: tabla ────────────────────────────────── */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={listSaleOrderDetail}
          emptyMessage="Venta sin productos."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
          dataFilters={filters}
          tableHeader={renderFilterInput}
          editMode="row"
          {...(editMode && { onRowEditComplete })}
        />
      </div>

      {/* ── Dialog edición mobile ───────────────────────────────── */}
      {editMode && (
        <Dialog
          header="Editar producto"
          visible={mobileEditVisible}
          onHide={() => setMobileEditVisible(false)}
          className="w-[95vw] md:hidden"
          footer={
            <div className="flex justify-end gap-2 pt-2">
              <Button
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={() => setMobileEditVisible(false)}
              />
              <Button
                label="Guardar"
                icon="pi pi-check"
                severity="success"
                onClick={handleMobileEditSave}
              />
            </div>
          }
        >
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Precio de venta ({currency})
              </label>
              <input
                type="number"
                className="p-inputtext p-component w-full"
                min={0}
                value={mobileEditData?.sale_price ?? ""}
                onChange={(e) =>
                  setMobileEditData((prev) =>
                    prev ? { ...prev, sale_price: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Cantidad</label>
              <input
                type="number"
                className="p-inputtext p-component w-full"
                min={1}
                step={1}
                value={mobileEditData?.quantity ?? ""}
                onChange={(e) =>
                  setMobileEditData((prev) =>
                    prev ? { ...prev, quantity: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Descuento</label>
              <SelectButton
                value={mobileEditData?.discount_type ?? ""}
                options={discountTypeOptions}
                optionLabel="label"
                optionValue="value"
                onChange={(e) => {
                  const val = e.value ?? "";
                  setMobileEditData((prev) =>
                    prev
                      ? { ...prev, discount_type: val, discount_value: val ? prev.discount_value : "" }
                      : null
                  );
                }}
                className="w-full"
              />
            </div>
            {mobileEditData?.discount_type && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Valor del descuento{" "}
                  {mobileEditData.discount_type === "PORCENTUAL" ? "(%)" : `(${currency})`}
                </label>
                <input
                  type="number"
                  className="p-inputtext p-component w-full"
                  min={0}
                  value={mobileEditData?.discount_value ?? ""}
                  onChange={(e) =>
                    setMobileEditData((prev) =>
                      prev ? { ...prev, discount_value: e.target.value } : null
                    )
                  }
                />
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* ── Dialog seriales ─────────────────────────────────────── */}
      <Dialog
        className="md:w-[700px] w-[95vw]"
        header={editMode ? "Agregar serial" : ""}
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        {currentSaleOrderDetail && (
          <SerialToDetail
            saleOrderId={saleOrderId}
            saleOrderDetailId={currentSaleOrderDetail?._id}
            editMode={editMode}
          />
        )}
      </Dialog>
    </Card>
  );
};

export default SaleOrderDetailList;
