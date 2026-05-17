import { Tag } from "primereact/tag";
import useProductList from "../../hooks/useProductList";

import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { memo, useCallback, useMemo, useState } from "react";
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

const DROPDOWN_PANEL_PROPS = {
  panelStyle: { maxWidth: "95vw" },
  panelClassName: "[&_.p-dropdown-item]:whitespace-normal [&_.p-dropdown-item]:leading-snug",
};

// ── Card memoizado: solo se re-renderiza si cambia su propio producto ──────────
interface ProductCardProps {
  product: IProduct;
  currency: string;
  onNavigate: (productId: string) => void;
  onStockClick: (product: IProduct, isSerial: boolean) => void;
  onEdit: (product: IProduct) => void;
  onDelete: (productId: string) => void;
}

const ProductCard = memo(({ product, currency, onNavigate, onStockClick, onEdit, onDelete }: ProductCardProps) => {
  const status = getStatus(product.status);
  const isSerial = product.stock_type === stockType.SERIALIZADO;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex gap-3 p-3 cursor-pointer active:bg-gray-50"
        onClick={() => onNavigate(product._id)}>
        <img
          src={product.image || defaultProduct}
          alt={product.name}
          loading="lazy"
          className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 overflow-hidden">
              <span className="text-xs font-mono text-gray-400">{product.code}</span>
              <p className="font-semibold text-gray-800 text-sm leading-tight break-words">
                {product.name}
              </p>
            </div>
            {status && (
              <Tag severity={status.severity as "danger" | "success"} className="shrink-0 text-xs">
                {status.label}
              </Tag>
            )}
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-1">
            {product.brand?.name && <span>{product.brand.name}</span>}
            {product.brand?.name && product.category?.name && (
              <span className="text-gray-300">·</span>
            )}
            {product.category?.name && <span>{product.category.name}</span>}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm font-bold text-green-700">
              {product.sale_price} {currency}
            </span>
            <span className="text-xs text-gray-400">
              {isSerial ? "Serializado" : "Individual"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pb-3 border-t border-gray-100 pt-2">
        <Button
          label={`Stock: ${product.stock}`}
          size="small"
          raised
          severity="info"
          onClick={() => onStockClick(product, isSerial)}
        />
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" raised size="small" severity="info"
            onClick={() => onEdit(product)} />
          <Button icon="pi pi-trash" raised size="small" severity="danger"
            onClick={() => onDelete(product._id)} />
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

const ProductList = () => {
  const { listProduct, loadingListProduct } = useProductList();

  // ── Filter state ──────────────────────────────────────────────
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const [visibleListInventory, setVisibleListInventory] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<IProduct | null>();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: LIST_PRODUCT }, { query: LIST_LOW_STOCK_PRODUCT }],
  });

  const statusBodyTemplate = (rowData: IProduct) => {
    const status = getStatus(rowData.status);
    if (status) {
      return <Tag severity={status.severity as "danger" | "success"}>{status.label}</Tag>;
    }
    return null;
  };

  const stockBodyTemplate = (rowData: IProduct) => {
    if (rowData.stock_type === stockType.SERIALIZADO) {
      return (
        <Button raised severity="info"
          onClick={() => { setCurrentProduct(rowData); setVisibleListSerial(true); }}>
          {rowData.stock}
        </Button>
      );
    }
    return (
      <Button raised severity="info"
        onClick={() => { setCurrentProduct(rowData); setVisibleListInventory(true); }}>
        {rowData.stock}
      </Button>
    );
  };

  const tableHeaderTemplate = useCallback(() => (
    <div className="flex justify-between items-center m-2 px-5">
      <h1 className="text-2xl font-bold">{`Lista de productos (${filteredData.length})`}</h1>
      <div className="flex gap-2">
        <Button id="btn-search-product" icon="pi pi-search" severity="info"
          tooltip="Buscar producto" tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleSearch(true)} raised />
        <Button id="btn-new-product" icon="pi pi-plus" severity="success"
          tooltip="Nuevo producto" tooltipOptions={{ position: "left" }}
          onClick={() => { setCurrentProduct(null); setVisibleForm(true); }} raised />
      </div>
    </div>
  ), [filteredData.length, setVisibleSearch, setCurrentProduct, setVisibleForm]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProduct({ variables: { productId } });
      if (data.deleteProduct.success)
        showToast({ detail: "Producto eliminado.", severity: ToastSeverity.Success });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  }, [dispatch, deleteProduct]);

  const handleNavigate = useCallback((productId: string) => {
    navigate(`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${productId}`);
  }, [navigate]);

  const handleStockClick = useCallback((product: IProduct, isSerial: boolean) => {
    setCurrentProduct(product);
    if (isSerial) setVisibleListSerial(true);
    else setVisibleListInventory(true);
  }, []);

  const handleEditClick = useCallback((product: IProduct) => {
    setCurrentProduct(product);
    setVisibleForm(true);
  }, []);

  const actionBodyTemplate = (rowData: IProduct) => (
    <div className="flex justify-center gap-2">
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-info"
        tooltip="Editar producto" tooltipOptions={{ position: "left" }}
        onClick={() => { setCurrentProduct(rowData); setVisibleForm(true); }} />
      <Button icon="pi pi-trash" raised severity="danger" aria-label="Eliminar"
        tooltip="Eliminar producto" tooltipOptions={{ position: "left" }}
        onClick={() => handleDeleteProduct(rowData._id)} />
    </div>
  );

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<IProduct[]>) => {
    navigate(`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<IProduct>[]>([
    { field: "code", header: "Codigo", sortable: true, style: { width: "10%" } },
    {
      field: "image", header: "Imagen", sortable: true, style: { width: "10%", justifyItems: "center" },
      body: (rowData: IProduct) => (
        <img className="w-[80px] h-[80px]" alt="image" loading="lazy"
          src={rowData.image ? rowData.image : defaultProduct} />
      ),
    },
    { field: "name", header: "Nombre", sortable: true, style: { width: "20%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options) },
    { field: "brand.name", header: "Marca", sortable: true, style: { width: "15%" } },
    { field: "category.name", header: "Categoria", sortable: true, style: { width: "15%" } },
    {
      field: "sale_price", header: "Precio de venta", sortable: true, style: { width: "10%" },
      body: (rowData: IProduct) => (
        <LabelInput className="justify-center" label={`${rowData.sale_price} ${currency}`} />
      ),
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options, true),
    },
    { field: "stock", header: "Stock", sortable: true, style: { width: "10%", textAlign: "center" }, body: stockBodyTemplate },
    { field: "stock_type", header: "Tipo de stock", sortable: true, style: { width: "10%", textAlign: "center" } },
    { field: "status", header: "Estado", sortable: true, body: statusBodyTemplate, style: { width: "10%", textAlign: "center" } },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  const dialogs = (
    <>
      <Dialog className="md:w-[50vw] w-[95vw]"
        header={currentProduct ? "Editar Producto" : "Nuevo Producto"}
        visible={visibleForm} onHide={() => setVisibleForm(false)}>
        <ProductForm setVisibleForm={setVisibleForm} productToEdit={currentProduct} />
      </Dialog>
      <Dialog className="md:w-[50vw] w-[95vw]" visible={visibleListSerial}
        header={currentProduct && `Seriales — (${currentProduct.code}) ${currentProduct.name}`}
        onHide={() => setVisibleListSerial(false)}>
        {currentProduct && <ProductSerialList product={currentProduct} />}
      </Dialog>
      <Dialog className="md:w-[80vw] w-[95vw]" visible={visibleListInventory}
        header={currentProduct && `Inventario — (${currentProduct.code}) ${currentProduct.name}`}
        onHide={() => setVisibleListInventory(false)}>
        {currentProduct && <ProductInventoryList product={currentProduct} />}
      </Dialog>
      <Dialog className="md:w-[50vw] w-[95vw]" visible={visibleSearch}
        header="Buscar producto" onHide={() => setVisibleSearch(false)}>
        <SearchProductForm />
      </Dialog>
    </>
  );

  if (loadingListProduct) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Panel de filtros — colapsable en mobile ───────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div
          className="flex items-center justify-between p-4 cursor-pointer md:cursor-default select-none"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <i className="pi pi-filter text-slate-500" />
            Filtros
            {hasActiveFilter && (
              <Tag severity="info" className="text-xs">
                {filteredData.length} resultado{filteredData.length !== 1 ? "s" : ""}
              </Tag>
            )}
          </span>
          <div className="flex items-center gap-2">
            {hasActiveFilter && (
              <Button label="Limpiar" icon="pi pi-times" size="small"
                severity="secondary" outlined
                onClick={(e) => { e.stopPropagation(); clearFilters(); }} />
            )}
            <i className={`pi pi-chevron-down md:hidden transition-transform duration-200 text-slate-400 ${filtersOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        <div className={`${filtersOpen ? "block" : "hidden"} md:block px-4 pb-4 border-t border-gray-100 pt-3`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Marca</label>
              <Dropdown value={brandFilter} options={brandOptions}
                onChange={(e) => setBrandFilter(e.value)}
                placeholder="Todas" showClear filter className="w-full text-sm"
                {...DROPDOWN_PANEL_PROPS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Categoría</label>
              <Dropdown value={categoryFilter} options={categoryOptions}
                onChange={(e) => setCategoryFilter(e.value)}
                placeholder="Todas" showClear filter className="w-full text-sm"
                {...DROPDOWN_PANEL_PROPS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Tipo de stock</label>
              <Dropdown value={stockTypeFilter} options={STOCK_TYPE_OPTIONS}
                onChange={(e) => setStockTypeFilter(e.value)}
                placeholder="Todos" showClear className="w-full text-sm"
                {...DROPDOWN_PANEL_PROPS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Estado</label>
              <Dropdown value={statusFilter} options={STATUS_OPTIONS}
                onChange={(e) => setStatusFilter(e.value)}
                placeholder="Todos" showClear className="w-full text-sm"
                {...DROPDOWN_PANEL_PROPS} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Cabecera mobile: título + botones ─────────────────── */}
      <div className="flex justify-between items-center px-1 md:hidden">
        <h1 className="text-xl font-bold text-gray-800">
          Productos <span className="text-base font-normal text-gray-400">({filteredData.length})</span>
        </h1>
        <div className="flex gap-2">
          <Button icon="pi pi-search" severity="info" raised size="small"
            onClick={() => setVisibleSearch(true)} />
          <Button icon="pi pi-plus" severity="success" raised size="small"
            onClick={() => { setCurrentProduct(null); setVisibleForm(true); }} />
        </div>
      </div>

      {/* ── Vista mobile: cards ────────────────────────────────── */}
      <div className="flex flex-col gap-2 md:hidden">
        {filteredData.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">Sin productos.</p>
        )}
        {filteredData.map((product: IProduct) => (
          <ProductCard
            key={product._id}
            product={product}
            currency={currency}
            onNavigate={handleNavigate}
            onStockClick={handleStockClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>

      {/* ── Vista desktop: tabla ───────────────────────────────── */}
      <Card id="product-list-table" className="hidden md:block py-2" header={tableHeaderTemplate}>
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
      </Card>

      {dialogs}
    </div>
  );
};

export default ProductList;
