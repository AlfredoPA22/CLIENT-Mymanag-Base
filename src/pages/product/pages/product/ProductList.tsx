import { Tag } from "primereact/tag";
import useProductList from "../../hooks/useProductList";

import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultProduct from "../../../../assets/defaultProduct.jpg";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { numberEditor } from "../../../../components/numberEditor/numberEditor";
import { textEditor } from "../../../../components/textEditor/textEditor";
import { DELETE_PRODUCT } from "../../../../graphql/mutations/Product";
import {
  LIST_LOW_STOCK_PRODUCT,
  LIST_PRODUCT,
} from "../../../../graphql/queries/Product";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { productStatus } from "../../../../utils/enums/productStatus";
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

const STOCK_TYPE_OPTIONS = [
  { label: "Serializado", value: stockType.SERIALIZADO },
  { label: "Individual", value: stockType.INDIVIDUAL },
];

const STATUS_OPTIONS = [
  { label: "Disponible", value: productStatus.DISPONIBLE },
  { label: "Sin stock", value: productStatus.SIN_STOCK },
];

const ProductList = () => {
  const { listProduct, loadingListProduct } = useProductList();

  // ── Filter state ──────────────────────────────────────────────
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockTypeFilter, setStockTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasActiveFilter = !!brandFilter || !!categoryFilter || !!stockTypeFilter || !!statusFilter;

  const clearFilters = () => {
    setBrandFilter("");
    setCategoryFilter("");
    setStockTypeFilter("");
    setStatusFilter("");
  };

  const brandOptions = useMemo(() => {
    const names = [...new Set(
      (listProduct ?? []).map((p: IProduct) => p.brand?.name).filter(Boolean)
    )];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [listProduct]);

  const categoryOptions = useMemo(() => {
    const names = [...new Set(
      (listProduct ?? []).map((p: IProduct) => p.category?.name).filter(Boolean)
    )];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [listProduct]);

  const filteredData = useMemo(() => {
    if (!listProduct) return [];
    return listProduct.filter((p: IProduct) => {
      if (brandFilter && p.brand?.name !== brandFilter) return false;
      if (categoryFilter && p.category?.name !== categoryFilter) return false;
      if (stockTypeFilter && p.stock_type !== stockTypeFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [listProduct, brandFilter, categoryFilter, stockTypeFilter, statusFilter]);

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
      {
        query: LIST_LOW_STOCK_PRODUCT,
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
        <h1 className="text-2xl font-bold">{`Lista de productos (${filteredData.length})`}</h1>

        <div className="flex gap-2">
          <Button
            id="btn-search-product"
            icon="pi pi-search"
            severity="info"
            tooltip="Buscar producto"
            tooltipOptions={{ position: "left" }}
            onClick={() => setVisibleSearch(true)}
            raised
          />

          <Button
            id="btn-new-product"
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
    <div className="flex flex-col gap-3">
      {/* ── Filter panel ──────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="pi pi-filter text-slate-500" />
            Filtros
            {hasActiveFilter && (
              <Tag severity="info" className="text-xs">{filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}</Tag>
            )}
          </span>
          {hasActiveFilter && (
            <Button
              label="Limpiar filtros"
              icon="pi pi-times"
              size="small"
              severity="secondary"
              outlined
              onClick={clearFilters}
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Marca */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Marca</label>
            <Dropdown
              value={brandFilter}
              options={brandOptions}
              onChange={(e) => setBrandFilter(e.value)}
              placeholder="Todas"
              showClear
              filter
              className="w-full text-sm"
            />
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Categoría</label>
            <Dropdown
              value={categoryFilter}
              options={categoryOptions}
              onChange={(e) => setCategoryFilter(e.value)}
              placeholder="Todas"
              showClear
              filter
              className="w-full text-sm"
            />
          </div>

          {/* Tipo de stock */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Tipo de stock</label>
            <Dropdown
              value={stockTypeFilter}
              options={STOCK_TYPE_OPTIONS}
              onChange={(e) => setStockTypeFilter(e.value)}
              placeholder="Todos"
              showClear
              className="w-full text-sm"
            />
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Estado</label>
            <Dropdown
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(e) => setStatusFilter(e.value)}
              placeholder="Todos"
              showClear
              className="w-full text-sm"
            />
          </div>
        </div>
      </div>

    <Card id="product-list-table" className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={filteredData}
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
    </div>
  );
};

export default ProductList;
