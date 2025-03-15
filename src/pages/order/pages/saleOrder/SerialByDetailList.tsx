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

interface SerialByDetailListProps {
  saleOrderDetailId: string;
  saleOrderId: string;
}

const SerialByDetailList: FC<SerialByDetailListProps> = ({
  saleOrderDetailId,
  saleOrderId,
}) => {
  const [deleteSerialToSaleOrderDetail] = useMutation(
    DELETE_SERIAL_TO_SALE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_SALE_ORDER_DETAIL,
          variables: {
            saleOrderId,
          },
        },
        {
          query: LIST_SERIAL_BY_SALE_ORDER_DETAIL,
          variables: {
            saleOrderDetailId,
          },
        },
      ],
    }
  );

  const {
    data: { listProductSerialBySaleOrder: listProductSerialBySaleOrder } = [],
    loading: loadingListSerialBySaleOrder,
    error,
  } = useQuery(LIST_SERIAL_BY_SALE_ORDER_DETAIL, {
    variables: {
      saleOrderDetailId,
    },
    fetchPolicy: "network-only",
  });

  const handleDeleteSerial = async (productSerialId: string) => {
    try {
      const { data } = await deleteSerialToSaleOrderDetail({
        variables: {
          productSerialId,
        },
      });
      if (data.deleteSerialToSaleOrderDetail.success) {
        showToast({
          detail: "Serial eliminado",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: ISaleOrderDetail) => {
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
      {loadingListSerialBySaleOrder ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listProductSerialBySaleOrder}
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
