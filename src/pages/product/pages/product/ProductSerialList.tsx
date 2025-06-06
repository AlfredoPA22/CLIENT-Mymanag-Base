import { useQuery } from "@apollo/client";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import TextLink from "../../../../components/TextLink/TextLink";
import { LIST_PRODUCT_SERIAL_BY_PRODUCT } from "../../../../graphql/queries/Product";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProduct } from "../../../../utils/interfaces/Product";
import { IProductSerial } from "../../../../utils/interfaces/ProductSerial";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { getStatus } from "../../../order/utils/getStatus";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";

interface ProductSerialListProps {
  product: IProduct;
}

const ProductSerialList: FC<ProductSerialListProps> = ({ product }) => {
  const {
    data: { listProductSerialByProduct: listProductSerial } = [],
    loading: loadingListProductSerial,
    error,
  } = useQuery(LIST_PRODUCT_SERIAL_BY_PRODUCT, {
    variables: { productId: product._id },
    fetchPolicy: "network-only",
  });

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

  const purchaseOrderBodyTemplate = (rowData: IProductSerial) => {
    if (rowData.purchase_order_detail) {
      return (
        <TextLink
          link={`${ROUTES_MOCK.PURCHASE_ORDERS}/detalle/${rowData.purchase_order_detail.purchase_order._id}`}
          text={rowData.purchase_order_detail.purchase_order.code}
        />
      );
    }
  };

  const saleOrderBodyTemplate = (rowData: IProductSerial) => {
    if (rowData.sale_order_detail) {
      return (
        <TextLink
          link={`${ROUTES_MOCK.SALE_ORDERS}/detalle/${rowData.sale_order_detail.sale_order._id}`}
          text={rowData.sale_order_detail.sale_order.code}
        />
      );
    }
  };

  const [columns] = useState<DataTableColumn<IProductSerial>[]>([
    {
      field: "serial",
      header: "Nombre",
      sortable: true,
      style: { width: "35%" },
    },
    {
      field: "warehouse.name",
      header: "Almacén",
      sortable: true,
      style: { width: "20%" },
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "15%", textAlign: "center" },
    },
    {
      field: "purchase_order_detail.purchase_order.code",
      header: "orden de compra",
      style: { width: "15%" },
      body: purchaseOrderBodyTemplate,
    },
    {
      field: "sale_order_detail.sale_order.code",
      header: "orden de venta",
      sortable: true,
      style: { width: "15%" },
      body: saleOrderBodyTemplate,
    },
  ]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProductSerial) {
    return <LoadingSpinner />;
  }

  return (
    <Table
      columns={columns}
      data={listProductSerial}
      emptyMessage="Sin seriales."
      size="small"
      dataFilters={filters}
      tableHeader={renderFilterInput}
    />
  );
};

export default ProductSerialList;
