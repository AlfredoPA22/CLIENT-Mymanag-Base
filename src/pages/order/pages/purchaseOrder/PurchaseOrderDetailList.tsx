import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { FC, useEffect, useState } from "react";
import Table from "../../../../components/datatable/Table";
import { LIST_PURCHASE_ORDER_DETAIL } from "../../../../graphql/queries/PurchaseOrderDetail";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IPurchaseOrderDetail } from "../../../../utils/interfaces/PurchaseOrderDetail";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import SerialToDetail from "./SerialToDetail";
import {
  DELETE_PRODUCT_TO_PURCHASE_ORDER_DETAIL,
  UPDATE_PURCHASE_ORDER_DETAIL,
} from "../../../../graphql/mutations/PurchaseOrderDetail";
import { FIND_PURCHASE_ORDER } from "../../../../graphql/queries/PurchaseOrder";
import { useDispatch } from "react-redux";
import { setPurchaseOrder } from "../../../../redux/slices/purchaseOrderSlice";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { ColumnEditorOptions } from "primereact/column";
import { numberEditor } from "../../../../components/numberEditor/numberEditor";
import { stockType } from "../../../../utils/enums/stockType.enum";

interface PurchaseOrderDetailListProps {
  purchaseOrderId: string;
}

const PurchaseOrderDetailList: FC<PurchaseOrderDetailListProps> = ({
  purchaseOrderId,
}) => {
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [currentPurchaseOrderDetail, setCurrentPurchaseOrderDetail] =
    useState<IPurchaseOrderDetail>();

  const client = useApolloClient();
  const dispatch = useDispatch();

  const [deleteProductToPurchaseOrderDetail] = useMutation(
    DELETE_PRODUCT_TO_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderId,
          },
        },
        {
          query: FIND_PURCHASE_ORDER,
          variables: { purchaseOrderId },
        },
      ],
    }
  );

  const [updatePurchaseOrderDetail] = useMutation(
    UPDATE_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderId,
          },
        },
        {
          query: FIND_PURCHASE_ORDER,
          variables: { purchaseOrderId },
        },
      ],
    }
  );

  const {
    data: { listPurchaseOrderDetail: listPurchaseOrderDetail } = [],
    loading: loadingListPurchaseOrderDetail,
    error,
  } = useQuery(LIST_PURCHASE_ORDER_DETAIL, {
    variables: {
      purchaseOrderId,
    },
    fetchPolicy: "network-only",
  });

  const handleDeleteProduct = async (purchaseOrderDetailId: string) => {
    try {
      const { data } = await deleteProductToPurchaseOrderDetail({
        variables: {
          purchaseOrderDetailId,
        },
      });
      const data2 = await client.query({
        query: FIND_PURCHASE_ORDER,
        variables: {
          purchaseOrderId,
        },
        fetchPolicy: "network-only",
      });
      if (data.deleteProductToPurchaseOrderDetail.success && data2.data) {
        showToast({
          detail: "Producto eliminado de la orden.",
          severity: ToastSeverity.Success,
        });
        dispatch(setPurchaseOrder(data2.data.findPurchaseOrder));
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: IPurchaseOrderDetail) => {
    return (
      <div className="flex justify-center gap-2">
        {rowData.product.stock_type === stockType.SERIALIZADO && (
          <Button
            tooltip="Agregar Seriales"
            icon="pi pi-cart-plus"
            rounded
            severity="success"
            aria-label="Cancel"
            onClick={() => {
              setCurrentPurchaseOrderDetail(rowData);
              setVisibleForm(true);
            }}
          />
        )}

        <Button
          tooltip="eliminar detalle"
          icon="pi pi-times"
          rounded
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteProduct(rowData._id)}
        />
      </div>
    );
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      if (e.newData.purchase_price <= 0 || e.newData.quantity <= 0) {
        showToast({
          detail: "El precio y la cantidad son obligatorios.",
          severity: ToastSeverity.Error,
        });
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
          variables: {
            purchaseOrderId,
          },
          fetchPolicy: "network-only",
        });

        if (data && data2.data) {
          dispatch(setPurchaseOrder(data2.data.findPurchaseOrder));
          showToast({
            detail: "Detalle actualizado.",
            severity: ToastSeverity.Success,
          });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrderDetail>[]>([
    {
      field: "product.name",
      header: "Producto",
      sortable: true,
    },
    {
      field: "purchase_price",
      header: "Precio de compra",
      sortable: true,
      body: (rowData: IPurchaseOrderDetail) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.purchase_price} ${currencySymbol}`}
        />
      ),
      fieldEditor: (options: ColumnEditorOptions) =>
        numberEditor(options, true),
    },
    {
      field: "quantity",
      header: "Cantidad",
      sortable: true,
      style: { textAlign: "center" },
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options),
    },
    {
      field: "subtotal",
      header: "Subtotal",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: IPurchaseOrderDetail) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.subtotal} ${currencySymbol}`}
        />
      ),
    },
    {
      field: "serials",
      header: "Seriales Añadidos",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: IPurchaseOrderDetail) => {
        if (rowData.product.stock_type === stockType.SERIALIZADO) {
          return <span>{rowData.serials}</span>;
        } else {
          return <>No corresponde</>;
        }
      },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [error]);

  return (
    <Card className="size-full" title="Productos de la compra">
      {loadingListPurchaseOrderDetail ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listPurchaseOrderDetail}
            emptyMessage="Compra sin productos."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
            editMode="row"
            onRowEditComplete={onRowEditComplete}
          />
          <Dialog
            className="md:w-[700px] w-[350px]"
            header="Agregar serial"
            visible={visibleForm}
            onHide={() => setVisibleForm(false)}
          >
            {currentPurchaseOrderDetail && (
              <SerialToDetail
                purchaseOrderId={purchaseOrderId}
                purchaseOrderDetailId={currentPurchaseOrderDetail?._id}
              />
            )}
          </Dialog>
        </div>
      )}
    </Card>
  );
};

export default PurchaseOrderDetailList;
