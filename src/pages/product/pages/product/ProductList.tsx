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
import ProductImagePlaceholder from "../../../../components/ProductImagePlaceholder/ProductImagePlaceholder";
import Table from "../../../../components/datatable/Table";
import RowActionButtons from "../../../../components/table/RowActionButtons";
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
import { useDispatch, useSelector } from "react-redux";
import { getToken } from "../../../../redux/accessors/auth.accessor";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import useAuth from "../../../auth/hooks/useAuth";
import { formatAmount } from "../../../../utils/currency";

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

// "Stock" no baja apenas algo se reserva (solo al aprobar la venta) — se usa
// tanto en la tabla de escritorio como en las cards mobile.
const isLowStock = (product: IProduct) =>
  product.min_stock > 0 && product.stock > 0 && product.stock <= product.min_stock;

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
      <div className="flex gap-3 p-3 cursor-pointer transition-colors duration-150 active:bg-gray-50"
        onClick={() => onNavigate(product._id)}>
        {product.image
          ? <img src={product.image} alt={product.name} loading="lazy" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-gray-100" />
          : <ProductImagePlaceholder name={product.name} className="w-16 h-16 rounded-lg shrink-0 border border-gray-100" />
        }
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
              {formatAmount(product.sale_price)} {currency}
            </span>
            <span className="text-xs text-gray-400">
              {isSerial ? "Serializado" : "Individual"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 pb-3 border-t border-gray-100 pt-2">
        <div className="flex flex-col items-start gap-0.5">
          <Button
            label={`Stock: ${product.stock}`}
            size="small"
            raised
            severity={product.stock <= 0 ? "danger" : isLowStock(product) ? "warning" : "info"}
            onClick={() => onStockClick(product, isSerial)}
          />
          {product.available_stock != null && product.available_stock < product.stock && (
            <span className="text-[10px] text-amber-600 font-medium">
              {product.available_stock} disponible
            </span>
          )}
        </div>
        <RowActionButtons
          actions={[
            { label: "Editar producto", icon: "pi pi-pencil", severity: "info", onClick: () => onEdit(product) },
            { label: "Eliminar producto", icon: "pi pi-trash", severity: "danger", onClick: () => onDelete(product._id) },
          ]}
        />
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

  const MOBILE_PAGE_SIZE = 20;
  const [mobilePage, setMobilePage] = useState(1);

  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleSearch, setVisibleSearch] = useState<boolean>(false);
  const [visibleListSerial, setVisibleListSerial] = useState<boolean>(false);
  const [visibleListInventory, setVisibleListInventory] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<IProduct | null>();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currency } = useAuth();
  const token = useSelector(getToken);

  const handleExportProducts = useCallback(async () => {
    try {
      dispatch(setIsBlocked(true));
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/product-export`,
        { headers: { Authorization: `${token || ""}` } }
      );
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Error al exportar los productos");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "productos.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({
        detail: error.message || "Error al exportar los productos",
        severity: ToastSeverity.Error,
      });
    } finally {
      dispatch(setIsBlocked(false));
    }
  }, [dispatch, token]);

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

  // available_stock menor a stock: hay unidades comprometidas en otra venta
  // que ya no están realmente libres. Se muestra chico debajo del número de
  // stock, solo cuando difiere, para no meter ruido en el caso común.
  const stockBodyTemplate = (rowData: IProduct) => {
    const isSerial = rowData.stock_type === stockType.SERIALIZADO;
    const outOfStock = rowData.stock <= 0;
    const severity = outOfStock ? "danger" : isLowStock(rowData) ? "warning" : "info";
    const hasReserved =
      rowData.available_stock != null && rowData.available_stock < rowData.stock;

    return (
      <div className="flex flex-col items-center gap-0.5">
        <Button raised severity={severity}
          onClick={() => {
            setCurrentProduct(rowData);
            if (isSerial) setVisibleListSerial(true);
            else setVisibleListInventory(true);
          }}>
          {rowData.stock}
        </Button>
        {hasReserved && (
          <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap">
            {rowData.available_stock} disp.
          </span>
        )}
      </div>
    );
  };

  const tableHeaderTemplate = useCallback(() => (
    <div className="flex justify-between items-center m-2 px-5">
      <h1 className="text-2xl font-bold">{`Lista de productos (${filteredData.length})`}</h1>
      <div className="flex gap-2">
        <Button id="btn-search-product" icon="pi pi-search" severity="info"
          tooltip="Buscar producto" tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleSearch(true)} raised />
        <Button id="btn-export-products" icon="pi pi-download" severity="secondary"
          tooltip="Exportar todos los productos" tooltipOptions={{ position: "left" }}
          onClick={handleExportProducts} raised />
        <Button id="btn-new-product" icon="pi pi-plus" severity="success"
          tooltip="Nuevo producto" tooltipOptions={{ position: "left" }}
          onClick={() => { setCurrentProduct(null); setVisibleForm(true); }} raised />
      </div>
    </div>
  ), [filteredData.length, setVisibleSearch, setCurrentProduct, setVisibleForm, handleExportProducts]);

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
    <RowActionButtons
      actions={[
        { label: "Editar producto", icon: "pi pi-pencil", severity: "info", onClick: () => { setCurrentProduct(rowData); setVisibleForm(true); } },
        { label: "Eliminar producto", icon: "pi pi-trash", severity: "danger", onClick: () => handleDeleteProduct(rowData._id) },
      ]}
    />
  );

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<IProduct[]>) => {
    navigate(`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${e.value._id}`);
  };

  const [columns] = useState<DataTableColumn<IProduct>[]>([
    { field: "code", header: "Codigo", sortable: true, style: { width: "10%" } },
    {
      field: "image", header: "Imagen", sortable: true, style: { width: "10%", justifyItems: "center" },
      body: (rowData: IProduct) => rowData.image
        ? <img className="w-[80px] h-[80px] object-cover rounded-lg" alt="image" loading="lazy" src={rowData.image} />
        : <ProductImagePlaceholder name={rowData.name} className="w-[80px] h-[80px] rounded-lg" />,
    },
    { field: "name", header: "Nombre", sortable: true, style: { width: "20%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options) },
    { field: "brand.name", header: "Marca", sortable: true, style: { width: "15%" } },
    { field: "category.name", header: "Categoria", sortable: true, style: { width: "15%" } },
    {
      field: "sale_price", header: "Precio de venta", sortable: true, style: { width: "10%", textAlign: "right" },
      body: (rowData: IProduct) => (
        <span className="font-semibold text-gray-800">{formatAmount(rowData.sale_price)} {currency}</span>
      ),
      fieldEditor: (options: ColumnEditorOptions) => numberEditor(options, true),
    },
    { field: "stock", header: "Stock", sortable: true, style: { width: "10%", textAlign: "center" }, body: stockBodyTemplate },
    {
      field: "stock_type", header: "Tipo de stock", sortable: true, style: { width: "10%", textAlign: "center" },
      body: (rowData: IProduct) => (
        <Tag
          severity={rowData.stock_type === stockType.SERIALIZADO ? "contrast" : "secondary"}
          value={rowData.stock_type === stockType.SERIALIZADO ? "Serializado" : "Individual"}
        />
      ),
    },
    { field: "status", header: "Estado", sortable: true, body: statusBodyTemplate, style: { width: "10%", textAlign: "center" } },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  // Fila con fondo ámbar suave cuando el stock ya tocó el mínimo — mismo
  // criterio que ya usa el tile "Bajo stock" del dashboard, pero visible acá
  // mismo en vez de tener que ir a buscarlo en otro lado.
  const rowClassName = (data: IProduct) => ({
    "bg-amber-50": isLowStock(data),
  });

  const dialogs = (
    <>
      <Dialog className="w-[95vw] md:w-[75vw] lg:w-[60vw] xl:w-[50vw]"
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
        <SearchProductForm onSelect={() => setVisibleSearch(false)} />
      </Dialog>
    </>
  );

  if (loadingListProduct) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Panel de filtros — colapsable en mobile ───────────── */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div
          className="flex items-center justify-between p-4 cursor-pointer select-none"
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
            <i className={`pi pi-chevron-down transition-transform duration-200 text-slate-400 ${filtersOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${filtersOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
         <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
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
        </div>
      </div>

      {/* ── Cabecera mobile: título + botones ─────────────────── */}
      <div className="flex justify-between items-center px-1 lg:hidden">
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
      <div className="flex flex-col gap-2 lg:hidden">
        {filteredData.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">Sin productos.</p>
        )}
        {filteredData.slice(0, mobilePage * MOBILE_PAGE_SIZE).map((product: IProduct) => (
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
        {mobilePage * MOBILE_PAGE_SIZE < filteredData.length && (
          <Button
            label={`Cargar más (${filteredData.length - mobilePage * MOBILE_PAGE_SIZE} restantes)`}
            icon="pi pi-chevron-down"
            severity="secondary"
            outlined
            className="w-full"
            onClick={() => setMobilePage((p) => p + 1)}
          />
        )}
      </div>

      {/* ── Vista desktop: tabla ───────────────────────────────── */}
      <Card id="product-list-table" className="hidden lg:block py-2" header={tableHeaderTemplate}>
        <Table
          columns={columns}
          data={filteredData}
          emptyMessage="Sin productos."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
          dataFilters={filters}
          tableHeader={renderFilterInput}
          onSelectionChange={handleSelectionChange}
          rowClassName={rowClassName}
        />
      </Card>

      {dialogs}
    </div>
  );
};

export default ProductList;
