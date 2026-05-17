import { useQuery } from "@apollo/client";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import TextLink from "../../../../components/TextLink/TextLink";
import { LIST_PRODUCT_INVENTORY_BY_PRODUCT } from "../../../../graphql/queries/Product";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProduct } from "../../../../utils/interfaces/Product";
import { IProductInventory } from "../../../../utils/interfaces/ProductInventory";
import { IProductSerial } from "../../../../utils/interfaces/ProductSerial";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { getStatus } from "../../../order/utils/getStatus";

interface ProductInventoryListProps {
  product: IProduct;
}

const ProductInventoryList: FC<ProductInventoryListProps> = ({ product }) => {
  const {
    data: { listProductInventoryByProduct: listProductInventory } = [],
    loading: loadingListProductInventory,
    error,
  } = useQuery(LIST_PRODUCT_INVENTORY_BY_PRODUCT, {
    variables: { productId: product._id },
    fetchPolicy: "cache-and-network",
  });

  const statusBodyTemplate = (rowData: IProductInventory) => {
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

  const purchaseOrderBodyTemplate = (rowData: IProductInventory) => {
    const purchaseOrderDetail = rowData.purchase_order_detail;
    const purchaseOrder = purchaseOrderDetail?.purchase_order;

    if (!purchaseOrder) {
      return <span className="text-gray-400 italic">Sin orden</span>;
    }

    const isApproved = purchaseOrder.status === orderStatus.APROBADO;

    return (
      <TextLink to={`/order/${isApproved ? "viewPurchaseOrder" : "editPurchaseOrder"}/${purchaseOrder._id}`}>
        {purchaseOrder.code}
      </TextLink>
    );
  };

  const [columns] = useState<DataTableColumn<IProductSerial>[]>([
    {
      field: "purchase_order_detail",
      header: "orden de compra",
      sortable: true,
      style: { width: "15%" },
      body: purchaseOrderBodyTemplate,
    },
    {
      field: "warehouse.name",
      header: "Almacén",
      sortable: true,
      style: { width: "25%" },
    },
    {
      field: "quantity",
      header: "Cantidad",
      sortable: true,
      style: { width: "10%" },
    },
    {
      field: "available",
      header: "Disponible",
      sortable: true,
      style: { width: "10%" },
    },
    {
      field: "reserved",
      header: "Reservados",
      sortable: true,
      style: { width: "10%" },
    },
    {
      field: "transferred",
      header: "Transferidos",
      sortable: true,
      style: { width: "10%" },
    },
    {
      field: "sold",
      header: "Vendidos",
      sortable: true,
      style: { width: "10%" },
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "10%", textAlign: "center" },
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

  if (loadingListProductInventory) {
    return <LoadingSpinner />;
  }

  return (
    <Table
      columns={columns}
      data={listProductInventory}
      emptyMessage="Sin stock."
      size="small"
      dataFilters={filters}
      tableHeader={renderFilterInput}
    />
  );
};

export default ProductInventoryList;
