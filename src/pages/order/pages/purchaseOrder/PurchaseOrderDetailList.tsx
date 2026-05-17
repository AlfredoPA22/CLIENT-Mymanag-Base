import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { numberEditor } from "../../../../components/numberEditor/numberEditor";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import TextLink from "../../../../components/TextLink/TextLink";
import {
  DELETE_PRODUCT_TO_PURCHASE_ORDER_DETAIL,
  UPDATE_PURCHASE_ORDER_DETAIL,
} from "../../../../graphql/mutations/PurchaseOrderDetail";
import { FIND_PURCHASE_ORDER } from "../../../../graphql/queries/PurchaseOrder";
import { LIST_PURCHASE_ORDER_DETAIL } from "../../../../graphql/queries/PurchaseOrderDetail";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { setPurchaseOrder } from "../../../../redux/slices/purchaseOrderSlice";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IPurchaseOrderDetail } from "../../../../utils/interfaces/PurchaseOrderDetail";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import SerialToDetail from "./SerialToDetail";
import useAuth from "../../../auth/hooks/useAuth";

interface PurchaseOrderDetailListProps {
  purchaseOrderId: string;
  editMode?: boolean;
}

const PurchaseOrderDetailList: FC<PurchaseOrderDetailListProps> = ({
  purchaseOrderId,
  editMode = true,
}) => {
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [currentPurchaseOrderDetail, setCurrentPurchaseOrderDetail] =
    useState<IPurchaseOrderDetail>();
  const [mobileEditVisible, setMobileEditVisible] = useState(false);
  const [mobileEditData, setMobileEditData] = useState<IPurchaseOrderDetail | null>(null);

  const client = useApolloClient();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [deleteProductToPurchaseOrderDetail] = useMutation(
    DELETE_PRODUCT_TO_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        { query: LIST_PURCHASE_ORDER_DETAIL, variables: { purchaseOrderId } },
        { query: FIND_PURCHASE_ORDER, variables: { purchaseOrderId } },
      ],
    }
  );

  const [updatePurchaseOrderDetail] = useMutation(UPDATE_PURCHASE_ORDER_DETAIL, {
    refetchQueries: [
      { query: LIST_PURCHASE_ORDER_DETAIL, variables: { purchaseOrderId } },
      { query: FIND_PURCHASE_ORDER, variables: { purchaseOrderId } },
    ],
  });

  const {
    data: { listPurchaseOrderDetail: listPurchaseOrderDetail } = [],
    loading: loadingListPurchaseOrderDetail,
    error,
  } = useQuery(LIST_PURCHASE_ORDER_DETAIL, {
    variables: { purchaseOrderId },
    fetchPolicy: "network-only",
  });

  const handleDeleteProduct = async (purchaseOrderDetailId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProductToPurchaseOrderDetail({
        variables: { purchaseOrderDetailId },
      });
      const data2 = await client.query({
        query: FIND_PURCHASE_ORDER,
        variables: { purchaseOrderId },
        fetchPolicy: "network-only",
      });
      if (data.deleteProductToPurchaseOrderDetail.success && data2.data) {
        showToast({ detail: "Producto eliminado de la orden.", severity: ToastSeverity.Success });
        dispatch(setPurchaseOrder(data2.data.findPurchaseOrder));
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleMobileEditSave = async () => {
    if (!mobileEditData) return;
    if (mobileEditData.purchase_price <= 0 || mobileEditData.quantity <= 0) {
      showToast({ detail: "El precio y la cantidad son obligatorios.", severity: ToastSeverity.Error });
      return;
    }
    try {
      dispatch(setIsBlocked(true));
      const { data } = await updatePurchaseOrderDetail({
        variables: {
          purchaseOrderDetailId: mobileEditData._id,
          purchase_price: mobileEditData.purchase_price,
          quantity: mobileEditData.quantity,
        },
      });
      const data2 = await client.query({
        query: FIND_PURCHASE_ORDER,
        variables: { purchaseOrderId },
        fetchPolicy: "network-only",
      });
      if (data && data2.data) {
        dispatch(setPurchaseOrder(data2.data.findPurchaseOrder));
        showToast({ detail: "Detalle actualizado.", severity: ToastSeverity.Success });
        setMobileEditVisible(false);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IPurchaseOrderDetail) => (
    <div className="flex justify-center gap-2">
      {rowData.product.stock_type === stockType.SERIALIZADO && (
        <Button
          tooltip={editMode ? "Agregar seriales" : "Ver seriales"}
          icon="pi pi-cart-plus"
          raised
          severity="success"
          onClick={() => {
            setCurrentPurchaseOrderDetail(rowData);
            setVisibleForm(true);
          }}
        />
      )}
      {editMode && (
        <Button
          tooltip="eliminar detalle"
          icon="pi pi-trash"
          raised
          severity="danger"
          onClick={() => handleDeleteProduct(rowData._id)}
        />
      )}
    </div>
  );

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
      if (e.newData.purchase_price <= 0 || e.newData.quantity <= 0) {
        showToast({ detail: "El precio y la cantidad son obligatorios.", severity: ToastSeverity.Error });
      } else {
        const { data } = await updatePurchaseOrderDetail({
          variables: {
            purchaseOrderDetailId: e.newData._id,
            purchase_price: e.newData.purchase_price,
            quantity: e.newData.quantity,
          },
        });
        const data2 = await client.query({
          query: FIND_PURCHASE_ORDER,
          variables: { purchaseOrderId },
          fetchPolicy: "network-only",
        });
        if (data && data2.data) {
          dispatch(setPurchaseOrder(data2.data.findPurchaseOrder));
          showToast({ detail: "Detalle actualizado.", severity: ToastSeverity.Success });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrderDetail>[]>([
    {
      field: "product.code",
      header: "Código",
      sortable: true,
      style: { width: "10%" },
      body: (rowData: IPurchaseOrderDetail) => (
        <TextLink to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${rowData.product._id}`}>
          {rowData.product.code}
        </TextLink>
      ),
    },
    { field: "product.name", header: "Producto", sortable: true, style: { width: "20%" } },
    {
      field: "purchase_price",
      header: "Precio de compra",
      sortable: true,
      style: { width: "15%" },
      body: (rowData: IPurchaseOrderDetail) => (
        <LabelInput className="justify-center" label={`${rowData.purchase_price} ${currency}`} />
      ),
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options, true),
    },
    {
      field: "quantity",
      header: "Cantidad",
      sortable: true,
      style: { textAlign: "center", width: "10%" },
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "subtotal",
      header: "Subtotal",
      sortable: true,
      style: { textAlign: "center", width: "15%" },
      body: (rowData: IPurchaseOrderDetail) => (
        <LabelInput className="justify-center" label={`${rowData.subtotal} ${currency}`} />
      ),
    },
    {
      field: "serials",
      header: "Seriales Añadidos",
      sortable: true,
      style: { textAlign: "center", width: "10%" },
      body: (rowData: IPurchaseOrderDetail) =>
        rowData.product.stock_type === stockType.SERIALIZADO
          ? <span>{rowData.serials}</span>
          : <>No corresponde</>,
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  if (loadingListPurchaseOrderDetail) return <TableSkeleton />;

  const serialDialog = (
    <Dialog
      className="md:w-[1000px] w-[95vw]"
      header={editMode ? "Agregar serial" : "Ver seriales"}
      visible={visibleForm}
      onHide={() => setVisibleForm(false)}
    >
      {currentPurchaseOrderDetail && (
        <SerialToDetail
          purchaseOrderId={purchaseOrderId}
          purchaseOrderDetailId={currentPurchaseOrderDetail._id}
          editMode={editMode}
        />
      )}
    </Dialog>
  );

  return (
    <>
      {/* ── Mobile: cards ─────────────────────────────────────── */}
      <div className="md:hidden mb-2">
        <Card title={`Productos de la compra (${listPurchaseOrderDetail?.length ?? 0})`}>
          {(!listPurchaseOrderDetail || listPurchaseOrderDetail.length === 0) && (
            <p className="text-center text-gray-400 py-4 text-sm">Compra sin productos.</p>
          )}
          <div className="flex flex-col gap-2">
            {listPurchaseOrderDetail?.map((item: IPurchaseOrderDetail) => {
              const isSerialized = item.product.stock_type === stockType.SERIALIZADO;
              return (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm"
                >
                  <div className="min-w-0 overflow-hidden mb-1">
                    <TextLink
                      to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${item.product._id}`}
                    >
                      <span className="text-xs font-medium">{item.product.code}</span>
                    </TextLink>
                    <p className="font-semibold text-gray-800 text-sm break-words mt-0.5">
                      {item.product.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mt-2">
                    <div>
                      <p className="text-gray-400">Precio</p>
                      <p className="font-semibold text-gray-800">{item.purchase_price} {currency}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Cant.</p>
                      <p className="font-semibold text-gray-800">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Subtotal</p>
                      <p className="font-semibold text-blue-700">{item.subtotal} {currency}</p>
                    </div>
                  </div>

                  {isSerialized && (
                    <p className="text-xs text-gray-500 mt-1">
                      Seriales añadidos: <span className="font-semibold">{item.serials}</span>
                    </p>
                  )}

                  <div className="flex gap-2 mt-2">
                    {isSerialized && (
                      <Button
                        icon="pi pi-cart-plus"
                        size="small"
                        severity="success"
                        raised
                        label={editMode ? "Seriales" : "Ver seriales"}
                        onClick={() => {
                          setCurrentPurchaseOrderDetail(item);
                          setVisibleForm(true);
                        }}
                      />
                    )}
                    {editMode && (
                      <>
                        <Button
                          icon="pi pi-pencil"
                          size="small"
                          severity="info"
                          raised
                          onClick={() => {
                            setMobileEditData({ ...item });
                            setMobileEditVisible(true);
                          }}
                        />
                        <Button
                          icon="pi pi-trash"
                          size="small"
                          severity="danger"
                          raised
                          onClick={() => handleDeleteProduct(item._id)}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Desktop: tabla ─────────────────────────────────────── */}
      <div className="hidden md:block">
        <Card title={`Productos de la compra (${listPurchaseOrderDetail?.length ?? 0})`}>
          <Table
            columns={columns}
            data={listPurchaseOrderDetail ?? []}
            emptyMessage="Compra sin productos."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
            editMode="row"
            {...(editMode && { onRowEditComplete })}
          />
        </Card>
      </div>

      {serialDialog}

      {/* ── Diálogo edición mobile ─────────────────────────────── */}
      <Dialog
        header="Editar producto"
        visible={mobileEditVisible}
        onHide={() => setMobileEditVisible(false)}
        className="w-[95vw]"
      >
        {mobileEditData && (
          <div className="flex flex-col gap-3 pt-1">
            <p className="font-semibold text-gray-800 text-sm">{mobileEditData.product.name}</p>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Precio de compra ({currency})</label>
              <InputNumber
                value={mobileEditData.purchase_price}
                onValueChange={(e) =>
                  setMobileEditData({ ...mobileEditData, purchase_price: e.value ?? 0 })
                }
                minFractionDigits={2}
                maxFractionDigits={2}
                min={0.01}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Cantidad</label>
              <InputNumber
                value={mobileEditData.quantity}
                onValueChange={(e) =>
                  setMobileEditData({ ...mobileEditData, quantity: e.value ?? 0 })
                }
                min={1}
                className="w-full"
              />
            </div>
            <Button
              label="Guardar"
              icon="pi pi-check"
              severity="success"
              onClick={handleMobileEditSave}
              className="w-full mt-1"
            />
          </div>
        )}
      </Dialog>
    </>
  );
};

export default PurchaseOrderDetailList;
