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

interface SerialByDetailListProps {
  purchaseOrderDetailId: string;
  purchaseOrderId: string;
}

const SerialByDetailList: FC<SerialByDetailListProps> = ({
  purchaseOrderDetailId,
  purchaseOrderId,
}) => {
  const [deleteSerialToPurchaseOrderDetail] = useMutation(
    DELETE_SERIAL_TO_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderId,
          },
        },
        {
          query: LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderDetailId,
          },
        },
      ],
    }
  );

  const {
    data: {
      listProductSerialByPurchaseOrder: listProductSerialByPurchaseOrder,
    } = [],
    loading: loadingListSerialByPurchaseOrder,
    error,
  } = useQuery(LIST_SERIAL_BY_PURCHASE_ORDER_DETAIL, {
    variables: {
      purchaseOrderDetailId,
    },
    fetchPolicy: "network-only",
  });

  const handleDeleteSerial = async (productSerialId: string) => {
    try {
      const { data } = await deleteSerialToPurchaseOrderDetail({
        variables: {
          productSerialId,
        },
      });
      if (data.deleteSerialToPurchaseOrderDetail.success) {
        showToast({
          detail: "Serial eliminado",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: IPurchaseOrderDetail) => {
    return (
      <div className="flex justify-center">
        <Button
          tooltip="eliminar serial"
          icon="pi pi-times"
          rounded
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteSerial(rowData._id)}
        />
      </div>
    );
  };

  const statusBodyTemplate = (rowData: IProductSerial) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag severity={severity as "danger" | "success" | "info" | "warning"}>
          {label}
        </Tag>
      );
    }
    return null;
  };

  const [columns] = useState<DataTableColumn<IProductSerial>[]>([
    {
      field: "serial",
      header: "Serial",
      sortable: true,
      style: { width: "60%" },
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "20%" },
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
    <Card className="size-full" title="Seriales asignados">
      {loadingListSerialByPurchaseOrder ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listProductSerialByPurchaseOrder}
            emptyMessage="Producto sin seriales asignados."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
          />
        </div>
      )}
    </Card>
  );
};

export default SerialByDetailList;
