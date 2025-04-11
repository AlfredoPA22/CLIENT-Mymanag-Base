import { Tag } from "primereact/tag";
import useProductList from "../hooks/useProductList";

import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { ColumnEditorOptions } from "primereact/column";
import {
  DataTableRowEditCompleteEvent,
  DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultProduct from "../../../assets/defaultProduct.jpg";
import Table from "../../../components/datatable/Table";
import LabelInput from "../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { numberEditor } from "../../../components/numberEditor/numberEditor";
import { textEditor } from "../../../components/textEditor/textEditor";
import {
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
} from "../../../graphql/mutations/Product";
import { LIST_PRODUCT } from "../../../graphql/queries/Product";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { currencySymbol } from "../../../utils/constants/currencyConstants";
import { stockType } from "../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProduct } from "../../../utils/interfaces/Product";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import { getStatus } from "../../order/utils/getStatus";
import ProductForm from "./ProductForm";
import ProductSerialList from "./ProductSerialList";
import ProductInventoryList from "./ProductInventoryList";

const ProductList = () => {
  const { listProduct, loadingListProduct } = useProductList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleListSerial, setVisibleListSerial] = useState<boolean>(false);
  const [visibleListInventory, setVisibleListInventory] =
    useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<IProduct>();

  const navigate = useNavigate();

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [
      {
        query: LIST_PRODUCT,
      },
    ],
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [
      {
        query: LIST_PRODUCT,
      },
    ],
  });

  const statusBodyTemplate = (rowData: IProduct) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return <Tag severity={severity as "danger" | "success"}>{label}</Tag>;
    }
    return null;
  };

  const stockBodyTemplate = (rowData: IProduct) => {
    if (rowData.stock_type === stockType.SERIALIZADO) {
      return (
        <Button
          raised
          onClick={() => {
            setCurrentProduct(rowData);
            setVisibleListSerial(true);
          }}
          severity="info"
        >
          {rowData.stock}
        </Button>
      );
    } else {
      return (
        <Button
          raised
          onClick={() => {
            setCurrentProduct(rowData);
            setVisibleListInventory(true);
          }}
          severity="info"
        >
          {rowData.stock}
        </Button>
      );
    }
  };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de productos (${listProduct.length})`}</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nuevo producto"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { data } = await deleteProduct({
        variables: {
          productId,
        },
      });

      if (data.deleteProduct.success) {
        showToast({
          detail: "Producto eliminado.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: IProduct) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="eliminar producto"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteProduct(rowData._id)}
        />
      </div>
    );
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      if (
        e.newData.name === "" ||
        e.newData.brand === "" ||
        e.newData.category === "" ||
        e.newData.sale_price <= 0
      ) {
        showToast({
          detail: "Campos incompletos",
          severity: ToastSeverity.Error,
        });
      } else {
        const { data } = await updateProduct({
          variables: {
            productId: e.newData._id,
            name: e.newData.name,
            description: e.newData.description,
            sale_price: e.newData.sale_price,
            brand: e.newData.brand._id,
            category: e.newData.category._id,
          },
        });

        if (data) {
          showToast({
            detail: "Producto actualizado.",
            severity: ToastSeverity.Success,
          });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IProduct[]>
  ) => {
    navigate(`/product/detail/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<IProduct>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
      style: { width: "10%" },
    },
    {
      field: "image",
      header: "Imagen",
      sortable: true,
      style: { width: "10%", justifyItems: "center" },
      body: (rowData: IProduct) => (
        <img
          className="w-[80px] h-[80px]"
          alt="image"
          src={rowData.image ? rowData.image : defaultProduct}
        />
      ),
    },
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      style: { width: "20%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "brand.name",
      header: "Marca",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "category.name",
      header: "Categoria",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "sale_price",
      header: "Precio de venta",
      sortable: true,
      style: { width: "10%" },
      body: (rowData: IProduct) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.sale_price} ${currencySymbol}`}
        />
      ),
      fieldEditor: (options: ColumnEditorOptions) =>
        numberEditor(options, true),
    },
    {
      field: "stock",
      header: "Stock",
      sortable: true,
      style: { width: "10%", textAlign: "center" },
      body: stockBodyTemplate,
    },
    {
      field: "stock_type",
      header: "Tipo de stock",
      sortable: true,
      style: { width: "10%", textAlign: "center" },
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "10%", textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProduct) {
    return <LoadingSpinner />;
  }

  return (
    <div className="size-full">
      {tableHeaderTemplate()}
      <Table
        columns={columns}
        data={listProduct}
        emptyMessage="Sin productos."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        editMode="row"
        onRowEditComplete={onRowEditComplete}
        onSelectionChange={handleSelectionChange}
      />
      <Dialog
        className="md:w-[50vw] w-[90vw]"
        header="Nuevo Producto"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <ProductForm setVisibleForm={setVisibleForm} />
      </Dialog>
      <Dialog
        className="md:w-[50vw] w-[90vw]"
        visible={visibleListSerial}
        header={
          currentProduct &&
          `Lista de seriales del producto (${currentProduct.code}) ${currentProduct.name}`
        }
        onHide={() => setVisibleListSerial(false)}
      >
        {currentProduct && <ProductSerialList product={currentProduct} />}
      </Dialog>
      <Dialog
        className="md:w-[50vw] w-[90vw]"
        visible={visibleListInventory}
        header={
          currentProduct &&
          `Inventario del producto (${currentProduct.code}) ${currentProduct.name}`
        }
        onHide={() => setVisibleListInventory(false)}
      >
        {currentProduct && <ProductInventoryList product={currentProduct} />}
      </Dialog>
    </div>
  );
};

export default ProductList;
