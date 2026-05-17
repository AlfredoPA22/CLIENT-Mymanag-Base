import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../../components/datatable/Table";
import {
  LIST_PURCHASE_ORDER_DETAIL,
  LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL,
} from "../../../../graphql/queries/PurchaseOrderDetail";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProductSerial } from "../../../../utils/interfaces/ProductSerial";
import { IPurchaseOrderDetail } from "../../../../utils/interfaces/PurchaseOrderDetail";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { getStatus } from "../../utils/getStatus";
import { DELETE_SERIAL_TO_PURCHASE_ORDER_DETAIL } from "../../../../graphql/mutations/PurchaseOrderDetail";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";

interface SerialByDetailListProps {
  purchaseOrderDetailId: string;
  purchaseOrderId: string;
  editMode?: boolean;
}

const SerialByDetailList: FC<SerialByDetailListProps> = ({
  purchaseOrderDetailId,
  purchaseOrderId,
  editMode = true,
}) => {
  const dispatch = useDispatch();

  const [deleteSerialToPurchaseOrderDetail] = useMutation(
    DELETE_SERIAL_TO_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        { query: LIST_PURCHASE_ORDER_DETAIL, variables: { purchaseOrderId } },
        { query: LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL, variables: { purchaseOrderDetailId } },
      ],
    }
  );

  const {
    data: { listProductSerialByPurchaseOrder: listProductSerialByPurchaseOrder } = [],
    loading: loadingListSerialByPurchaseOrder,
    error,
  } = useQuery(LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL, {
    variables: { purchaseOrderDetailId },
    fetchPolicy: "network-only",
  });

  const handleDeleteSerial = async (productSerialId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteSerialToPurchaseOrderDetail({ variables: { productSerialId } });
      if (data.deleteSerialToPurchaseOrderDetail.success) {
        showToast({ detail: "Serial eliminado", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IPurchaseOrderDetail) => (
    <div className="flex justify-center">
      <Button
        tooltip="eliminar serial"
        icon="pi pi-trash"
        raised
        severity="danger"
        onClick={() => handleDeleteSerial(rowData._id)}
      />
    </div>
  );

  const statusBodyTemplate = (rowData: IProductSerial) => {
    const status = getStatus(rowData.status);
    if (status) {
      return (
        <Tag severity={status.severity as "danger" | "success" | "info" | "warning"}>
          {status.label}
        </Tag>
      );
    }
    return null;
  };

  const [columns] = useState<DataTableColumn<IProductSerial>[]>([
    { field: "serial", header: "Serial", sortable: true, style: { width: "50%" } },
    { field: "warehouse.name", header: "Almacén", sortable: true, style: { width: "35%" } },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "15%" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  if (loadingListSerialByPurchaseOrder) return <LoadingSpinner />;

  const count = listProductSerialByPurchaseOrder?.length ?? 0;

  return (
    <Card className="size-full" title={`Seriales asignados (${count})`}>
      {/* ── Mobile: cards ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:hidden">
        {count === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">
            Producto sin seriales asignados.
          </p>
        )}
        {listProductSerialByPurchaseOrder?.map((item: IProductSerial) => {
          const status = getStatus(item.status);
          return (
            <div
              key={item._id}
              className="flex items-center justify-between gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm"
            >
              <div className="min-w-0 overflow-hidden flex-1">
                <p className="font-semibold text-gray-800 text-sm break-all">{item.serial}</p>
                {item.warehouse?.name && (
                  <p className="text-xs text-gray-500 break-words">{item.warehouse.name}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {status && (
                  <Tag severity={status.severity as "danger" | "success" | "info" | "warning"}>
                    {status.label}
                  </Tag>
                )}
                {editMode && (
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    raised
                    onClick={() => handleDeleteSerial(item._id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: tabla ─────────────────────────────────────── */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={listProductSerialByPurchaseOrder ?? []}
          emptyMessage="Producto sin seriales asignados."
          size="small"
          {...(editMode && { actionBodyTemplate })}
          dataFilters={filters}
          tableHeader={renderFilterInput}
        />
      </div>
    </Card>
  );
};

export default SerialByDetailList;
