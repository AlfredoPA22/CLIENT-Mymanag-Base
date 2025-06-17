import { Tag } from "primereact/tag";
import useProductList from "../../hooks/useProductList";

import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultProduct from "../../../../assets/defaultProduct.jpg";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { numberEditor } from "../../../../components/numberEditor/numberEditor";
import { textEditor } from "../../../../components/textEditor/textEditor";
import { DELETE_PRODUCT } from "../../../../graphql/mutations/Product";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProduct } from "../../../../utils/interfaces/Product";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { getStatus } from "../../../order/utils/getStatus";
import ProductForm from "./ProductForm";
import SearchProductForm from "./SearchProductForm";
import ProductSerialList from "./ProductSerialList";
import ProductInventoryList from "./ProductInventoryList";
import { Card } from "primereact/card";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import useAuth from "../../../auth/hooks/useAuth";

const ProductList = () => {
  const { listProduct, loadingListProduct } = useProductList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleSearch, setVisibleSearch] = useState<boolean>(false);
  const [visibleListSerial, setVisibleListSerial] = useState<boolean>(false);
  const [visibleListInventory, setVisibleListInventory] =
    useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<IProduct | null>();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
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

        <div className="flex gap-2">
          <Button
            icon="pi pi-search"
            severity="info"
            tooltip="Buscar producto"
            tooltipOptions={{ position: "left" }}
            onClick={() => setVisibleSearch(true)}
            raised
          />

          <Button
            icon="pi pi-plus"
            severity="success"
            tooltip="Nuevo producto"
            tooltipOptions={{ position: "left" }}
            onClick={() => {
              setCurrentProduct(null);
              setVisibleForm(true);
            }}
            raised
          />
        </div>
      </div>
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      dispatch(setIsBlocked(true));
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
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IProduct) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info"
          onClick={() => {
            setCurrentProduct(rowData);
            setVisibleForm(true);
          }}
          tooltip="Editar producto"
          tooltipOptions={{ position: "left" }}
        />

        <Button
          tooltip="Eliminar producto"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Eliminar"
          onClick={() => handleDeleteProduct(rowData._id)}
        />
      </div>
    );
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IProduct[]>
  ) => {
    navigate(
      `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${e.value._id}`
    );
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
          label={`${rowData.sale_price} ${currency}`}
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
    <Card className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listProduct}
        emptyMessage="Sin productos."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        onSelectionChange={handleSelectionChange}
      />
      <Dialog
        className="md:w-[50vw] w-[90vw]"
        header={currentProduct ? "Editar Producto" : "Nuevo Producto"}
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <ProductForm
          setVisibleForm={setVisibleForm}
          productToEdit={currentProduct}
        />
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
        className="md:w-[80vw] w-[90vw]"
        visible={visibleListInventory}
        header={
          currentProduct &&
          `Inventario del producto (${currentProduct.code}) ${currentProduct.name}`
        }
        onHide={() => setVisibleListInventory(false)}
      >
        {currentProduct && <ProductInventoryList product={currentProduct} />}
      </Dialog>
      <Dialog
        className="md:w-[50vw] w-[90vw]"
        visible={visibleSearch}
        header="Buscar producto"
        onHide={() => setVisibleSearch(false)}
      >
        <SearchProductForm />
      </Dialog>
    </Card>
  );
};

export default ProductList;
