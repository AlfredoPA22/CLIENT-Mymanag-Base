import { useQuery } from "@apollo/client";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../components/datatable/Table";
import TextLink from "../../../components/TextLink/TextLink";
import { LIST_PRODUCT_SERIAL_BY_PRODUCT } from "../../../graphql/queries/Product";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { orderStatus } from "../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProduct } from "../../../utils/interfaces/Product";
import { IProductSerial } from "../../../utils/interfaces/ProductSerial";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import { getStatus } from "../../order/utils/getStatus";

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
    if (
      rowData.purchase_order_detail.purchase_order.status ===
      orderStatus.APROBADO
    ) {
      return (
        <TextLink
          link={`/order/viewPurchaseOrder/${rowData.purchase_order_detail.purchase_order._id}`}
          text={rowData.purchase_order_detail.purchase_order.code}
        />
      );
    } else {
      return (
        <TextLink
          link={`/order/editPurchaseOrder/${rowData.purchase_order_detail.purchase_order._id}`}
          text={rowData.purchase_order_detail.purchase_order.code}
        />
      );
    }
  };

  const saleOrderBodyTemplate = (rowData: IProductSerial) => {
    if (rowData.sale_order_detail) {
      if (
        rowData.sale_order_detail.sale_order.status ===
        orderStatus.APROBADO
      ) {
        return (
          <TextLink
            link={`/order/viewSaleOrder/${rowData.sale_order_detail.sale_order._id}`}
            text={rowData.sale_order_detail.sale_order.code}
          />
        );
      } else {
        return (
          <TextLink
            link={`/order/editSaleOrder/${rowData.sale_order_detail.sale_order._id}`}
            text={rowData.sale_order_detail.sale_order.code}
          />
        );
      }
    }
  };

  const [columns] = useState<DataTableColumn<IProductSerial>[]>([
    {
      field: "serial",
      header: "Nombre",
      sortable: true,
      style: { width: "30%" },
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "20%", textAlign: "center" },
    },
    {
      field: "purchase_order_detail.purchase_order.code",
      header: "orden de compra",
      style: { width: "25%" },
      body: purchaseOrderBodyTemplate,
    },
    {
      field: "sale_order_detail.sale_order.code",
      header: "orden de venta",
      sortable: true,
      style: { width: "25%" },
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

  return (
    <Card
      className="size-full"
      title={
        product &&
        `Lista de seriales del producto (${product.code}) ${product.name}`
      }
    >
      {loadingListProductSerial ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listProductSerial}
            emptyMessage="Sin seriales."
            size="small"
            dataFilters={filters}
            tableHeader={renderFilterInput}
          />
        </div>
      )}
    </Card>
  );
};

export default ProductSerialList;
