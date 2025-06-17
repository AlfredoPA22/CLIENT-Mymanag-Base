import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { numberEditor } from "../../../../components/numberEditor/numberEditor";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import {
  DELETE_PRODUCT_TO_PURCHASE_ORDER_DETAIL,
  UPDATE_PURCHASE_ORDER_DETAIL,
} from "../../../../graphql/mutations/PurchaseOrderDetail";
import { FIND_PURCHASE_ORDER } from "../../../../graphql/queries/PurchaseOrder";
import { LIST_PURCHASE_ORDER_DETAIL } from "../../../../graphql/queries/PurchaseOrderDetail";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { setPurchaseOrder } from "../../../../redux/slices/purchaseOrderSlice";
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

  const client = useApolloClient();
  const dispatch = useDispatch();
  const { currency } = useAuth();

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
      dispatch(setIsBlocked(true));
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
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IPurchaseOrderDetail) => {
    return (
      <div className="flex justify-center gap-2">
        {rowData.product.stock_type === stockType.SERIALIZADO && (
          <Button
            tooltip={editMode ? "Agregar seriales" : "Ver seriales"}
            icon="pi pi-cart-plus"
            raised
            severity="success"
            aria-label="Cancel"
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
            aria-label="Cancel"
            onClick={() => handleDeleteProduct(rowData._id)}
          />
        )}
      </div>
    );
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
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
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrderDetail>[]>([
    {
      field: "product.name",
      header: "Producto",
      sortable: true,
      style: { width: "20%" },
    },
    {
      field: "purchase_price",
      header: "Precio de compra",
      sortable: true,
      style: { width: "15%" },
      body: (rowData: IPurchaseOrderDetail) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.purchase_price} ${currency}`}
        />
      ),
      fieldEditor: (options: ColumnEditorOptions) =>
        numberEditor(options, true),
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
        <LabelInput
          className="justify-center"
          label={`${rowData.subtotal} ${currency}`}
        />
      ),
    },
    {
      field: "serials",
      header: "Seriales Añadidos",
      sortable: true,
      style: { textAlign: "center", width: "10%" },
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

  if (loadingListPurchaseOrderDetail) {
    return <TableSkeleton />;
  }

  return (
    <Card title={`Productos de la compra (${listPurchaseOrderDetail.length})`}>
      <Table
        columns={columns}
        data={listPurchaseOrderDetail}
        emptyMessage="Compra sin productos."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        editMode="row"
        {...(editMode && { onRowEditComplete })}
      />
      <Dialog
        className="md:w-[1000px] w-[350px]"
        header={editMode ? "Agregar serial" : ""}
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        {currentPurchaseOrderDetail && (
          <SerialToDetail
            purchaseOrderId={purchaseOrderId}
            purchaseOrderDetailId={currentPurchaseOrderDetail?._id}
            editMode={editMode}
          />
        )}
      </Dialog>
    </Card>
  );
};

export default PurchaseOrderDetailList;
