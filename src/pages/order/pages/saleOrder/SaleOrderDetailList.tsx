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

interface SaleOrderDetailListProps {
  saleOrderId: string;
  editMode?: boolean;
}

const SaleOrderDetailList: FC<SaleOrderDetailListProps> = ({
  saleOrderId,
  editMode = true,
}) => {
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [currentSaleOrderDetail, setCurrentSaleOrderDetail] =
    useState<ISaleOrderDetail>();

  const client = useApolloClient();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [deleteProductToSaleOrderDetail] = useMutation(
    DELETE_PRODUCT_TO_SALE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_SALE_ORDER_DETAIL,
          variables: {
            saleOrderId,
          },
        },
        {
          query: FIND_SALE_ORDER,
          variables: { saleOrderId },
        },
      ],
    }
  );

  const [updateSaleOrderDetail] = useMutation(UPDATE_SALE_ORDER_DETAIL, {
    refetchQueries: [
      {
        query: LIST_SALE_ORDER_DETAIL,
        variables: {
          saleOrderId,
        },
      },
      {
        query: FIND_SALE_ORDER,
        variables: { saleOrderId },
      },
    ],
  });

  const {
    data: { listSaleOrderDetail: listSaleOrderDetail } = [],
    loading: loadingListSaleOrderDetail,
    error,
  } = useQuery(LIST_SALE_ORDER_DETAIL, {
    variables: {
      saleOrderId,
    },
    fetchPolicy: "network-only",
  });

  const handleDeleteProduct = async (saleOrderDetailId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProductToSaleOrderDetail({
        variables: {
          saleOrderDetailId,
        },
      });
      const data2 = await client.query({
        query: FIND_SALE_ORDER,
        variables: {
          saleOrderId,
        },
        fetchPolicy: "network-only",
      });
      if (data.deleteProductToSaleOrderDetail.success && data2.data) {
        showToast({
          detail: "Producto eliminado de la venta.",
          severity: ToastSeverity.Success,
        });
        dispatch(setSaleOrder(data2.data.findSaleOrder));
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
            aria-label="Cancel"
            onClick={() => {
              setCurrentSaleOrderDetail(rowData);
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
          },
        });

        const data2 = await client.query({
          query: FIND_SALE_ORDER,
          variables: {
            saleOrderId,
          },
          fetchPolicy: "network-only",
        });

        if (data && data2.data) {
          dispatch(setSaleOrder(data2.data.findSaleOrder));
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

  const [columns] = useState<DataTableColumn<ISaleOrderDetail>[]>([
    {
      field: "product.name",
      header: "Producto",
      sortable: true,
      style: { width: "20%" },
    },
    {
      field: "sale_price",
      header: "Precio de venta",
      sortable: true,
      style: { width: "15%" },
      body: (rowData: ISaleOrderDetail) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.sale_price} ${currency}`}
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
      body: (rowData: ISaleOrderDetail) => (
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
      body: (rowData: ISaleOrderDetail) => {
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

  if (loadingListSaleOrderDetail) {
    return <TableSkeleton />;
  }

  return (
    <Card
      title={`Productos de la venta (${
        listSaleOrderDetail ? listSaleOrderDetail.length : ""
      })`}
    >
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
      <Dialog
        className="md:w-[700px] w-[350px]"
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
