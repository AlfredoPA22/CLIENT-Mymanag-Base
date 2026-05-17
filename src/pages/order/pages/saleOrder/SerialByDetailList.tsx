import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../../components/datatable/Table";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProductSerial } from "../../../../utils/interfaces/ProductSerial";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { getStatus } from "../../utils/getStatus";
import { DELETE_SERIAL_TO_SALE_ORDER_DETAIL } from "../../../../graphql/mutations/SaleOrderDetail";
import {
  LIST_SALE_ORDER_DETAIL,
  LIST_SERIAL_BY_SALE_ORDER_DETAIL,
} from "../../../../graphql/queries/SaleOrderDetail";
import { ISaleOrderDetail } from "../../../../utils/interfaces/SaleOrderDetail";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";

interface SerialByDetailListProps {
  saleOrderDetailId: string;
  saleOrderId: string;
  editMode?: boolean;
}

const SerialByDetailList: FC<SerialByDetailListProps> = ({
  saleOrderDetailId,
  saleOrderId,
  editMode = true,
}) => {
  const dispatch = useDispatch();

  const [deleteSerialToSaleOrderDetail] = useMutation(
    DELETE_SERIAL_TO_SALE_ORDER_DETAIL,
    {
      refetchQueries: [
        { query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } },
        { query: LIST_SERIAL_BY_SALE_ORDER_DETAIL, variables: { saleOrderDetailId } },
      ],
    }
  );

  const {
    data: { listProductSerialBySaleOrder: listProductSerialBySaleOrder } = [],
    loading: loadingListSerialBySaleOrder,
    error,
  } = useQuery(LIST_SERIAL_BY_SALE_ORDER_DETAIL, {
    variables: { saleOrderDetailId },
    fetchPolicy: "network-only",
  });

  const handleDeleteSerial = async (productSerialId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteSerialToSaleOrderDetail({ variables: { productSerialId } });
      if (data.deleteSerialToSaleOrderDetail.success) {
        showToast({ detail: "Serial eliminado", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: ISaleOrderDetail) => (
    <div className="flex justify-center">
      <Button tooltip="eliminar serial" icon="pi pi-trash" raised severity="danger"
        onClick={() => handleDeleteSerial(rowData._id)} />
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
    { field: "status", header: "Estado", sortable: true, body: statusBodyTemplate, style: { width: "15%" } },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  if (loadingListSerialBySaleOrder) return <LoadingSpinner />;

  const list: IProductSerial[] = listProductSerialBySaleOrder ?? [];
  const title = `Seriales asignados (${list.length})`;

  return (
    <>
      {/* ── Mobile ────────────────────────────────────────────── */}
      <Card className="md:hidden" title={title}>
        {list.length === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">Producto sin seriales asignados.</p>
        )}
        <div className="flex flex-col gap-2">
          {list.map((row: IProductSerial) => {
            const status = getStatus(row.status);
            return (
              <div key={row._id} className="border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-mono font-semibold text-gray-800 break-all flex-1">{row.serial}</p>
                  {status && (
                    <Tag severity={status.severity as "danger" | "success" | "info" | "warning"} className="shrink-0 text-xs">
                      {status.label}
                    </Tag>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  {row.warehouse?.name && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="pi pi-building text-[10px]" />
                      {row.warehouse.name}
                    </span>
                  )}
                  {editMode && (
                    <Button icon="pi pi-trash" size="small" severity="danger" raised
                      onClick={() => handleDeleteSerial(row._id)} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Desktop ───────────────────────────────────────────── */}
      <Card className="hidden md:block size-full" title={title}>
        <Table
          columns={columns}
          data={list}
          emptyMessage="Producto sin seriales asignados."
          size="small"
          {...(editMode && { actionBodyTemplate })}
          dataFilters={filters}
          tableHeader={renderFilterInput}
        />
      </Card>
    </>
  );
};

export default SerialByDetailList;
