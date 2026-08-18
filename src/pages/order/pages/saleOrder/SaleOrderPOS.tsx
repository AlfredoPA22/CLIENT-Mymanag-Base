import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { SelectButton } from "primereact/selectbutton";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAbility } from "../../../../casl/AbilityContext";
import { canDoAny } from "../../../../casl/ability";
import BarcodeScannerButton from "../../../../components/barcodeScanner/BarcodeScannerButton";
import ProductImagePlaceholder from "../../../../components/ProductImagePlaceholder/ProductImagePlaceholder";
import CreatableAutoComplete from "../../../../components/creatableAutoComplete/CreatableAutoComplete";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { CREATE_CLIENT } from "../../../../graphql/mutations/Client";
import { CREATE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
import { ADD_SERIAL_TO_SALE_ORDER_DETAIL, CREATE_SALE_ORDER_DETAIL } from "../../../../graphql/mutations/SaleOrderDetail";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { FIND_PRODUCT_SERIAL_BY_SERIAL, LIST_PRODUCT_INVENTORY_BY_PRODUCT, SEARCH_PRODUCT } from "../../../../graphql/queries/Product";
import { LIST_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import useQrPaymentAvailable from "../../../../hooks/useQrPaymentAvailable";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../../../routes/RouteMocks";
import { convertCurrency, formatAmount, round2 } from "../../../../utils/currency";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProduct } from "../../../../utils/interfaces/Product";
import { IProductInventory } from "../../../../utils/interfaces/ProductInventory";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import { showToast } from "../../../../utils/toastUtils";
import useAuth from "../../../auth/hooks/useAuth";
import useClientList from "../../../client/hooks/useClientList";
import useProductList from "../../../product/hooks/useProductList";
import useWarehouseList from "../../../product/hooks/useWarehouseList";
import { getSalePaymentMethodOptions } from "../../utils/salePaymentMethodMock";
import { saleOrderPaymentMethodOptions } from "../../utils/saleOrderPaymentMethodMock";
import ResolveStockShortageModal from "./ResolveStockShortageModal";
import ResolveSerialWarehouseModal from "./ResolveSerialWarehouseModal";

interface CartLine {
  product: IProduct;
  quantity: number;
  // Solo para Individual: stock disponible en el almacén elegido para la
  // nota (posWarehouseId), leído al agregar el producto por primera vez.
  // Los +/- de cantidad comparan contra este número en memoria, sin
  // consultar la red en cada click — mismo criterio que ya se usaba con
  // product.stock (global) antes de este cambio.
  availableStock?: number;
  discountType: string;
  // Para "FIJO" se guarda en la moneda BASE de la empresa (igual que
  // product.sale_price), no en la moneda elegida en el toggle — así, si el
  // usuario cambia de $ a Bs a mitad de camino, el descuento se recalcula a
  // su equivalente en vez de quedar con el mismo número mal interpretado.
  // Para "PORCENTUAL" no aplica ninguna conversión (el % no tiene moneda).
  discountValue: number | null;
  // Seriales ya leídos (escaneados) para este producto, en productos
  // serializados — se asignan al crear el detalle de la venta al cobrar. Si
  // la cantidad termina siendo mayor a los seriales leídos, el resto se
  // asigna después manualmente desde el detalle, como hoy.
  serials?: string[];
}

const DISCOUNT_TYPES = [
  { label: "Sin desc.", value: "NONE" },
  { label: "Fijo", value: "FIJO" },
  { label: "%", value: "PORCENTUAL" },
];

// Mismo cálculo que calcDetailDiscount() en el backend — solo para la vista
// previa del subtotal en el carrito, el backend recalcula/valida igual.
const calcLineDiscount = (gross: number, type: string, value: number | null): number => {
  if (!value || value <= 0) return 0;
  if (type === "PORCENTUAL") return Math.min(gross * (value / 100), gross);
  if (type === "FIJO") return Math.min(value, gross);
  return 0;
};

interface CartPanelProps {
  cart: CartLine[];
  total: number;
  currency: string;
  convertPrice: (amount: number) => number;
  convertToBase: (amount: number) => number;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onUpdateDiscount: (productId: string, type: string, value: number | null) => void;
  onCheckout: () => void;
}

const CartPanel = ({ cart, total, currency, convertPrice, convertToBase, onIncrement, onDecrement, onSetQuantity, onRemove, onUpdateDiscount, onCheckout }: CartPanelProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ability = useAbility();
  const canApplyDiscount = canDoAny(ability, ["APPLY_DISCOUNT"]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-sm font-bold text-slate-800">Carrito ({cart.length})</h2>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {cart.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Todavía no agregaste productos.</p>
        )}
        {cart.map((line) => {
          const unitPrice = convertPrice(line.product.sale_price);
          const gross = unitPrice * line.quantity;
          // El descuento FIJO se guarda en moneda base — se convierte a la
          // moneda mostrada recién acá, para el cálculo y la vista previa.
          const discountValueDisplay =
            line.discountType === "FIJO" && line.discountValue != null
              ? convertPrice(line.discountValue)
              : line.discountValue;
          const discount = calcLineDiscount(gross, line.discountType, discountValueDisplay);
          const isExpanded = expandedId === line.product._id;
          return (
            <div key={line.product._id} className="border-b border-gray-100 pb-2 flex flex-col gap-1.5">
              <p className="text-sm font-medium text-gray-800 leading-snug break-words">{line.product.name}</p>

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-400">{formatAmount(unitPrice)} {currency} c/u</p>
                <div className="flex items-center gap-1 shrink-0">
                  <Button icon="pi pi-minus" size="small" severity="secondary" outlined rounded onClick={() => onDecrement(line.product._id)} />
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => onSetQuantity(line.product._id, Number(e.target.value))}
                    className="p-inputtext p-component w-16 px-1 text-center text-sm"
                  />
                  <Button icon="pi pi-plus" size="small" severity="secondary" outlined rounded onClick={() => onIncrement(line.product._id)} />
                  <Button icon="pi pi-trash" size="small" severity="danger" text rounded onClick={() => onRemove(line.product._id)} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                {canApplyDiscount ? (
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => setExpandedId(isExpanded ? null : line.product._id)}
                  >
                    {discount > 0 ? `Descuento: -${formatAmount(discount)} ${currency}` : "Agregar descuento"}
                  </button>
                ) : <span />}
                <span className="text-sm font-semibold text-gray-700">{formatAmount(gross - discount)} {currency}</span>
              </div>

              {canApplyDiscount && isExpanded && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <SelectButton
                    value={line.discountType}
                    options={DISCOUNT_TYPES}
                    onChange={(e) => {
                      const val = (e.value as string) ?? "NONE";
                      onUpdateDiscount(line.product._id, val, val === "NONE" ? null : line.discountValue);
                    }}
                    className="text-xs [&_.p-button]:px-2 [&_.p-button]:py-1"
                  />
                  {line.discountType !== "NONE" && (
                    <input
                      type="number"
                      min={0}
                      value={discountValueDisplay != null ? round2(discountValueDisplay) : ""}
                      onChange={(e) => {
                        if (!e.target.value) {
                          onUpdateDiscount(line.product._id, line.discountType, null);
                          return;
                        }
                        const typed = Number(e.target.value);
                        const stored = line.discountType === "FIJO" ? convertToBase(typed) : typed;
                        onUpdateDiscount(line.product._id, line.discountType, stored);
                      }}
                      placeholder={line.discountType === "PORCENTUAL" ? "%" : currency}
                      className="p-inputtext p-component w-20 text-xs"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-xl font-bold text-green-600">{formatAmount(total)} {currency}</span>
        </div>
        <Button
          label="Completar Venta"
          icon="pi pi-check-circle"
          severity="success"
          className="w-full justify-center"
          disabled={cart.length === 0}
          onClick={onCheckout}
        />
      </div>
    </div>
  );
};

const SaleOrderPOS = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apolloClient = useApolloClient();
  const { currency } = useAuth();
  const qrAvailable = useQrPaymentAvailable();

  const { listProduct, loadingListProduct } = useProductList();
  const { listClientSelect, refetchListClient } = useClientList();
  const { listWarehouse: listWarehouseRaw } = useWarehouseList();
  const listWarehouse = listWarehouseRaw ?? [];
  const { data: companyData } = useQuery(DETAIL_COMPANY);
  const company = companyData?.detailCompany;

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IReactSelect | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Contado");
  const [contadoPaymentMethod, setContadoPaymentMethod] = useState("Efectivo");
  const [selectedNoteCurrency, setSelectedNoteCurrency] = useState<string>("$");
  const [submitting, setSubmitting] = useState(false);
  const [scanningSerial, setScanningSerial] = useState(false);

  // Almacén único para toda la nota, elegido antes de poder tocar productos
  // (mismo criterio que el formulario clásico) — se autoasigna en silencio
  // si la empresa tiene un solo almacén, o se pide explícitamente si tiene
  // más de uno. Una vez elegido, no se vuelve a preguntar.
  const [posWarehouse, setPosWarehouse] = useState<IWarehouse | null>(null);
  const [showWarehouseGate, setShowWarehouseGate] = useState(false);
  const [pendingWarehouse, setPendingWarehouse] = useState<IWarehouse | null>(null);
  const posWarehouseId = posWarehouse?._id ?? null;

  useEffect(() => {
    if (posWarehouse || listWarehouse.length === 0) return;
    if (listWarehouse.length === 1) {
      setPosWarehouse(listWarehouse[0]);
    } else {
      setShowWarehouseGate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listWarehouse]);

  const [stockShortage, setStockShortage] = useState<{
    product: IProduct;
    neededQuantity: number;
    onResolved: () => void | Promise<void>;
  } | null>(null);

  const [serialMismatch, setSerialMismatch] = useState<{
    serial: string;
    productId: string;
    productName: string;
    originId: string;
    originName: string;
  } | null>(null);

  // Stock disponible fresco del producto en el almacén elegido para la
  // nota — se consulta solo cuando hace falta (agregar por primera vez, o
  // al abrir/resolver el modal de faltante), nunca en cada click de +/-.
  const fetchAvailableInPosWarehouse = async (productId: string): Promise<number> => {
    if (!posWarehouseId) return 0;
    const { data } = await apolloClient.query({
      query: LIST_PRODUCT_INVENTORY_BY_PRODUCT,
      variables: { productId },
      fetchPolicy: "network-only",
    });
    const inventories: IProductInventory[] = data?.listProductInventoryByProduct ?? [];
    // Puede haber más de un registro para el mismo almacén (uno por lote de
    // compra, uno por cada transferencia aprobada) — hay que sumarlos todos,
    // no quedarse con el primero.
    return inventories
      .filter((inv) => inv.warehouse?._id === posWarehouseId)
      .reduce((sum, inv) => sum + (inv.available ?? 0), 0);
  };

  const [createSaleOrder] = useMutation(CREATE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }],
  });
  const [createSaleOrderDetail] = useMutation(CREATE_SALE_ORDER_DETAIL);
  const [addSerialToSaleOrderDetail] = useMutation(ADD_SERIAL_TO_SALE_ORDER_DETAIL);
  // Sin refetchQueries acá a propósito — mismo bug ya encontrado en
  // ProductForm.tsx/PurchaseOrderDetailForm.tsx: `{query: LIST_CLIENT}`
  // refresca cualquier observer activo de esa query, y si queda en vuelo
  // justo cuando este checkout se cierra y se reabre podía dejar el select
  // de cliente vacío. Se llama a refetchListClient directamente en
  // onCreateClient en vez de depender del matching implícito.
  const [createClient] = useMutation(CREATE_CLIENT);

  const needsExchangeRate = company?.currency === "$" && !company?.exchange_rate;

  // Moneda en la que va a quedar registrada la nota — solo relevante en
  // empresas que operan en $ (única moneda con alterna, ver SaleOrderForm.tsx).
  // El catálogo (product.sale_price) siempre está en la moneda base de la
  // empresa, así que si se elige Bs hay que convertir precio y descuento fijo
  // al armar cada línea, igual que hace el formulario clásico.
  const noteCurrency = company?.currency === "$" && selectedNoteCurrency === "Bs" ? "Bs" : company?.currency ?? currency;

  const categoryOptions = useMemo(() => {
    const names = [...new Set(listProduct.map((p: IProduct) => p.category?.name).filter(Boolean))];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [listProduct]);

  const brandOptions = useMemo(() => {
    const names = [...new Set(listProduct.map((p: IProduct) => p.brand?.name).filter(Boolean))];
    return names.sort().map((n) => ({ label: n, value: n }));
  }, [listProduct]);

  const hasActiveFilter = !!categoryFilter || !!brandFilter;

  const clearFilters = () => {
    setCategoryFilter("");
    setBrandFilter("");
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return listProduct.filter((p: IProduct) => {
      if (term) {
        const matchesTerm =
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          p.brand?.name?.toLowerCase().includes(term);
        if (!matchesTerm) return false;
      }
      if (categoryFilter && p.category?.name !== categoryFilter) return false;
      if (brandFilter && p.brand?.name !== brandFilter) return false;
      return true;
    });
  }, [listProduct, search, categoryFilter, brandFilter]);

  // Secciona la grilla por categoría para que se vea ordenado en vez de un
  // solo bloque amontonado — si ya hay un filtro de categoría activo no tiene
  // sentido repetir el mismo encabezado, así que en ese caso queda una sola sección.
  const groupedProducts = useMemo(() => {
    if (categoryFilter) return [[categoryFilter, filteredProducts] as [string, IProduct[]]];
    const groups = new Map<string, IProduct[]>();
    filteredProducts.forEach((p: IProduct) => {
      const key = p.category?.name || "Sin categoría";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredProducts, categoryFilter]);

  // Convierte un monto de la moneda base del catálogo a la moneda elegida en
  // el toggle general — se usa para TODO lo que se ve/edita en esta pantalla
  // (grilla, carrito, descuentos), no solo al cobrar, para que elegir Bs
  // realmente muestre y permita cargar todo en Bs de punta a punta.
  const convertPrice = (amount: number) =>
    convertCurrency(amount, company?.currency ?? currency, noteCurrency, company?.exchange_rate);

  // Inversa de convertPrice — para guardar en moneda base lo que el usuario
  // tipeó mientras miraba la pantalla en la moneda elegida (ver CartLine.discountValue).
  const convertToBase = (amount: number) =>
    convertCurrency(amount, noteCurrency, company?.currency ?? currency, company?.exchange_rate);

  const cartTotal = cart.reduce((acc, line) => {
    const gross = convertPrice(line.product.sale_price) * line.quantity;
    const discountValueDisplay =
      line.discountType === "FIJO" && line.discountValue != null
        ? convertPrice(line.discountValue)
        : line.discountValue;
    return acc + (gross - calcLineDiscount(gross, line.discountType, discountValueDisplay));
  }, 0);

  const handleAddToCart = async (product: IProduct) => {
    if (product.stock <= 0) {
      showToast({ detail: "Sin stock disponible", severity: ToastSeverity.Warn });
      return;
    }
    const existing = cart.find((l) => l.product._id === product._id);
    if (existing) {
      await handleIncrement(product._id);
      return;
    }

    if (product.stock_type !== stockType.INDIVIDUAL) {
      setCart((prev) => [...prev, { product, quantity: 1, discountType: "NONE", discountValue: null }]);
      return;
    }

    const available = await fetchAvailableInPosWarehouse(product._id);
    if (available < 1) {
      if (!posWarehouseId) {
        showToast({ detail: "No hay un almacén elegido para esta venta", severity: ToastSeverity.Warn });
        return;
      }
      setStockShortage({
        product,
        neededQuantity: 1,
        onResolved: async () => {
          const fresh = await fetchAvailableInPosWarehouse(product._id);
          if (fresh < 1) {
            showToast({
              detail: `Sigue sin haber stock de ${product.name} en ese almacén`,
              severity: ToastSeverity.Warn,
            });
            return;
          }
          setCart((prev) => [
            ...prev,
            { product, quantity: 1, availableStock: fresh, discountType: "NONE", discountValue: null },
          ]);
        },
      });
      return;
    }
    setCart((prev) => [
      ...prev,
      { product, quantity: 1, availableStock: available, discountType: "NONE", discountValue: null },
    ]);
  };

  // Flujo rápido para mostrador: el vendedor lee el serial (lector físico
  // tipeando + Enter, o la cámara vía BarcodeScannerButton) y con eso solo
  // ya queda el producto agregado y ese serial guardado — no hace falta
  // buscar el producto a mano primero. searchProduct ya existe (lo usa
  // SearchProductForm) y busca por serial exacto, con fallback a código/nombre.
  const handleScanSerial = async (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;
    setScanningSerial(true);
    try {
      const { data } = await apolloClient.query({
        query: SEARCH_PRODUCT,
        variables: { serial: value, exact: true, warehouseId: posWarehouseId },
        fetchPolicy: "network-only",
      });
      const product: IProduct | null = data?.searchProduct ?? null;
      if (!product) {
        showToast({ detail: `No se encontró ningún producto para "${value}"`, severity: ToastSeverity.Warn });
        return;
      }
      if (product.stock <= 0) {
        showToast({ detail: `${product.name} no tiene stock disponible`, severity: ToastSeverity.Warn });
        return;
      }

      const isSerialProduct = product.stock_type === stockType.SERIALIZADO;
      const existing = cart.find((l) => l.product._id === product._id);

      if (isSerialProduct && existing?.serials?.includes(value)) {
        showToast({ detail: "Ese serial ya fue leído en esta venta", severity: ToastSeverity.Warn });
        return;
      }

      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast({ detail: "No hay más stock de este producto", severity: ToastSeverity.Warn });
          return;
        }
        setCart((prev) =>
          prev.map((l) =>
            l.product._id === product._id
              ? { ...l, quantity: l.quantity + 1, serials: isSerialProduct ? [...(l.serials ?? []), value] : l.serials }
              : l
          )
        );
      } else {
        // Los seriales escaneados siempre son de productos Serializados (ver
        // searchProduct con exact: true) — no necesitan almacén de origen.
        setCart((prev) => [
          ...prev,
          {
            product,
            quantity: 1,
            discountType: "NONE",
            discountValue: null,
            serials: isSerialProduct ? [value] : undefined,
          },
        ]);
      }

      showToast({
        detail: isSerialProduct ? `Agregado: ${product.name} (serial ${value})` : `Agregado: ${product.name}`,
        severity: ToastSeverity.Success,
      });
      setSearch("");
    } catch (error: any) {
      if (typeof error.message === "string" && error.message.includes("Este serial pertenece a otro almacén")) {
        const { data: serialData } = await apolloClient.query({
          query: FIND_PRODUCT_SERIAL_BY_SERIAL,
          variables: { serial: value },
          fetchPolicy: "network-only",
        });
        const foundSerial = serialData?.findProductSerialBySerial;
        if (foundSerial?.warehouse && foundSerial?.product) {
          setSerialMismatch({
            serial: value,
            productId: foundSerial.product._id,
            productName: foundSerial.product.name,
            originId: foundSerial.warehouse._id,
            originName: foundSerial.warehouse.name,
          });
          return;
        }
      }
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      setScanningSerial(false);
    }
  };

  const handleUpdateDiscount = (productId: string, discountType: string, discountValue: number | null) => {
    setCart((prev) =>
      prev.map((l) => (l.product._id === productId ? { ...l, discountType, discountValue } : l))
    );
  };

  const handleIncrement = async (productId: string) => {
    const line = cart.find((l) => l.product._id === productId);
    if (!line) return;
    const nextQty = line.quantity + 1;
    if (nextQty > line.product.stock) {
      showToast({ detail: "No hay más stock de este producto", severity: ToastSeverity.Warn });
      return;
    }
    if (line.product.stock_type === stockType.INDIVIDUAL) {
      const available = line.availableStock ?? 0;
      if (nextQty > available) {
        if (!posWarehouseId) {
          showToast({ detail: "No hay un almacén elegido para esta venta", severity: ToastSeverity.Warn });
          return;
        }
        setStockShortage({
          product: line.product,
          neededQuantity: nextQty,
          onResolved: async () => {
            const fresh = await fetchAvailableInPosWarehouse(productId);
            if (fresh < nextQty) {
              showToast({
                detail: `Todavía no alcanza el stock en ese almacén (disponible: ${fresh})`,
                severity: ToastSeverity.Warn,
              });
              setCart((prev) =>
                prev.map((l) => (l.product._id === productId ? { ...l, availableStock: fresh } : l))
              );
              return;
            }
            setCart((prev) =>
              prev.map((l) => (l.product._id === productId ? { ...l, quantity: nextQty, availableStock: fresh } : l))
            );
          },
        });
        return;
      }
    }
    setCart((prev) => prev.map((l) => (l.product._id === productId ? { ...l, quantity: nextQty } : l)));
  };

  const handleDecrement = (productId: string) => {
    setCart((prev) =>
      prev
        .map((l) => (l.product._id === productId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  // Setear la cantidad a mano en vez de tener que clickear "+" una por una
  // (útil para ventas grandes, ej. 100 unidades de un mismo producto).
  const handleSetQuantity = async (productId: string, quantity: number) => {
    const line = cart.find((l) => l.product._id === productId);
    if (!line) return;
    if (!quantity || quantity <= 0) {
      setCart((prev) => prev.filter((l) => l.product._id !== productId));
      return;
    }
    let targetQty = quantity;
    if (targetQty > line.product.stock) {
      showToast({ detail: `Solo hay ${line.product.stock} unidades disponibles`, severity: ToastSeverity.Warn });
      targetQty = line.product.stock;
    }
    if (line.product.stock_type === stockType.INDIVIDUAL) {
      const available = line.availableStock ?? 0;
      if (targetQty > available) {
        if (!posWarehouseId) {
          showToast({ detail: "No hay un almacén elegido para esta venta", severity: ToastSeverity.Warn });
          return;
        }
        const finalQty = targetQty;
        setStockShortage({
          product: line.product,
          neededQuantity: finalQty,
          onResolved: async () => {
            const fresh = await fetchAvailableInPosWarehouse(productId);
            if (fresh < finalQty) {
              showToast({
                detail: `Todavía no alcanza el stock en ese almacén (disponible: ${fresh})`,
                severity: ToastSeverity.Warn,
              });
              setCart((prev) =>
                prev.map((l) => (l.product._id === productId ? { ...l, availableStock: fresh } : l))
              );
              return;
            }
            setCart((prev) =>
              prev.map((l) => (l.product._id === productId ? { ...l, quantity: finalQty, availableStock: fresh } : l))
            );
          },
        });
        return;
      }
    }
    setCart((prev) => prev.map((l) => (l.product._id === productId ? { ...l, quantity: targetQty } : l)));
  };

  const handleRemove = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.product._id !== productId));
  };

  const handleOpenCheckout = () => {
    setShowMobileCart(false);
    setShowCheckout(true);
    // La lista de clientes se trae una sola vez al entrar a POS — si alguien
    // creó o editó un cliente desde otra pantalla mientras esta sesión
    // seguía abierta (turnos largos), quedaba desactualizada. Se refresca
    // acá para que el que se busca esté siempre.
    refetchListClient();
  };

  const handleClientChange = (value: IReactSelect | null) => {
    setSelectedClient(value);
  };

  const onCreateClient = async (inputValue: string) => {
    try {
      const { data } = await createClient({
        variables: { fullName: inputValue, email: "", address: "", phoneNumber: "" },
      });
      if (data) {
        showToast({ detail: "Cliente creado", severity: ToastSeverity.Success });
        setSelectedClient({ value: data.createClient._id, label: data.createClient.fullName });
        await refetchListClient();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const resetAfterCheckout = () => {
    setCart([]);
    setSelectedClient(null);
    setPaymentMethod("Contado");
    setContadoPaymentMethod("Efectivo");
    setShowCheckout(false);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedClient) {
      showToast({ detail: "Selecciona un cliente", severity: ToastSeverity.Warn });
      return;
    }
    if (cart.length === 0) {
      showToast({ detail: "El carrito está vacío", severity: ToastSeverity.Warn });
      return;
    }

    setSubmitting(true);
    dispatch(setIsBlocked(true));
    try {
      const { data: orderData } = await createSaleOrder({
        variables: {
          date: new Date(),
          client: selectedClient.value,
          payment_method: paymentMethod,
          contado_payment_method: paymentMethod === "Contado" ? contadoPaymentMethod : undefined,
          currency: company?.currency === "$" && selectedNoteCurrency === "Bs" ? "Bs" : undefined,
          warehouse: posWarehouseId ?? undefined,
        },
      });
      const orderId = orderData.createSaleOrder._id;

      // sale_price y el descuento FIJO se guardan en moneda base (ver
      // CartLine.discountValue) — se convierten a noteCurrency recién acá,
      // que es la moneda en la que efectivamente se registra la nota.
      const failedProducts: string[] = [];
      let pendingSerials = false;
      const failedSerials: string[] = [];
      for (const line of cart) {
        try {
          const { data: detailData } = await createSaleOrderDetail({
            variables: {
              product: line.product._id,
              sale_order: orderId,
              sale_price: convertPrice(line.product.sale_price),
              quantity: line.quantity,
              discount_type: line.discountType === "NONE" ? undefined : line.discountType,
              discount_value:
                (line.discountType === "FIJO" && line.discountValue != null
                  ? convertPrice(line.discountValue)
                  : line.discountValue) ?? undefined,
            },
          });

          // Los seriales que se leyeron con el escáner se asignan de una vez,
          // recién ahora que existe el sale_order_detail al que engancharlos.
          const detailId = detailData.createSaleOrderDetail._id;
          for (const serial of line.serials ?? []) {
            try {
              await addSerialToSaleOrderDetail({ variables: { sale_order_detail: detailId, serial } });
            } catch {
              failedSerials.push(serial);
            }
          }
          if (line.product.stock_type === stockType.SERIALIZADO && line.quantity > (line.serials?.length ?? 0)) {
            pendingSerials = true;
          }
        } catch {
          failedProducts.push(line.product.name);
        }
      }

      if (failedProducts.length > 0 || failedSerials.length > 0) {
        const parts = [];
        if (failedProducts.length > 0) parts.push(`productos: ${failedProducts.join(", ")}`);
        if (failedSerials.length > 0) parts.push(`seriales: ${failedSerials.join(", ")}`);
        showToast({
          detail: `No se pudieron agregar (${parts.join(" · ")}). Revisa la venta antes de aprobarla.`,
          severity: ToastSeverity.Warn,
        });
      } else if (pendingSerials) {
        // Puede haber quedado cantidad sin serial leído (ej. subieron la
        // cantidad a mano después de escanear) — eso se termina de asignar
        // después, en el detalle de la venta, antes de aprobar.
        showToast({
          detail: "Venta creada en Borrador. Todavía faltan seriales por asignar antes de aprobarla.",
          severity: ToastSeverity.Info,
        });
      } else {
        showToast({ detail: "Venta creada en Borrador", severity: ToastSeverity.Success });
      }

      resetAfterCheckout();
      navigate(`${ROUTES_MOCK.SALE_ORDERS}/detalle/${orderId}`);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      setSubmitting(false);
      dispatch(setIsBlocked(false));
    }
  };

  const checkoutContent = (
    <div className="flex flex-col gap-4 pt-1">
      <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
        <span className="text-sm text-gray-500">{cart.length} producto{cart.length !== 1 ? "s" : ""}</span>
        <span className="text-lg font-bold text-green-600">{formatAmount(cartTotal)} {noteCurrency}</span>
      </div>
      <CreatableAutoComplete
        label="Cliente"
        name="client"
        placeholder="Seleccionar o escribir cliente"
        mandatory
        options={listClientSelect}
        onChange={handleClientChange}
        onCreateOption={onCreateClient}
        value={selectedClient}
      />
      <DropdownInput
        label="Condición de pago"
        name="payment_method"
        optionLabel="label"
        optionValue="value"
        mandatory
        options={saleOrderPaymentMethodOptions}
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.value)}
        appendTo={document.body}
      />
      {paymentMethod === "Contado" && (
        <DropdownInput
          label="Método de pago"
          name="contado_payment_method"
          optionLabel="label"
          optionValue="value"
          optionDisabled="disabled"
          mandatory
          options={getSalePaymentMethodOptions(qrAvailable)}
          value={contadoPaymentMethod}
          onChange={(e) => setContadoPaymentMethod(e.value)}
          appendTo={document.body}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* ── Buscador + grilla de productos ─────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            {scanningSerial ? (
              <i className="pi pi-spin pi-spinner absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            ) : (
              <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            )}
            <InputText
              className="w-full pl-9 pr-9"
              placeholder="Buscar por nombre, código o marca... o leer un serial + Enter"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScanSerial(search);
              }}
            />
            {search && (
              <i
                className="pi pi-times absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setSearch("")}
              />
            )}
          </div>
          <BarcodeScannerButton onScan={handleScanSerial} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {posWarehouse && (
            <span className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-2.5 py-1 whitespace-nowrap">
              <i className="pi pi-building text-[10px]" /> Vendiendo desde: {posWarehouse.name}
            </span>
          )}
          <Dropdown
            value={categoryFilter}
            options={categoryOptions}
            onChange={(e) => setCategoryFilter(e.value)}
            placeholder="Categoría"
            showClear
            filter
            filterPlaceholder="Buscar categoría..."
            className="w-64"
          />
          <Dropdown
            value={brandFilter}
            options={brandOptions}
            onChange={(e) => setBrandFilter(e.value)}
            placeholder="Marca"
            showClear
            filter
            filterPlaceholder="Buscar marca..."
            className="w-64"
          />
          {hasActiveFilter && (
            <Button label="Limpiar" icon="pi pi-times" size="small" severity="secondary" outlined onClick={clearFilters} />
          )}
          {company?.currency === "$" && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Ver y vender en:</span>
              <SelectButton
                value={selectedNoteCurrency}
                options={[
                  { label: "$", value: "$" },
                  { label: "Bs", value: "Bs" },
                ]}
                onChange={(e) => e.value && setSelectedNoteCurrency(e.value)}
              />
            </div>
          )}
          <span className={`text-xs text-gray-400 whitespace-nowrap ${company?.currency === "$" ? "" : "ml-auto"}`}>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {needsExchangeRate && (
          <p className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700">
            No tienes un tipo de cambio configurado. No se puede registrar la venta hasta que se configure en Ajustes de la empresa.
          </p>
        )}

        {loadingListProduct ? (
          <p className="text-center text-gray-400 py-8">Cargando productos...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Sin productos.</p>
        ) : (
          <div className="flex flex-col gap-4 pb-20 lg:pb-0">
            {groupedProducts.map(([categoryName, products]) => (
              <div key={categoryName} className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide sticky top-0 bg-gray-50 py-1 px-1 rounded z-[1]">
                  {categoryName} <span className="font-normal text-slate-400">({products.length})</span>
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2">
                  {products.map((product: IProduct) => {
                    const outOfStock = product.stock <= 0;
                    const cartQty = cart.find((l) => l.product._id === product._id)?.quantity ?? 0;
                    const inCart = cartQty > 0;
                    return (
                      <div
                        key={product._id}
                        className={`relative flex flex-col rounded-lg overflow-hidden shadow-sm transition-colors duration-150 border-2 ${
                          inCart ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"
                        }`}
                      >
                        {inCart && (
                          <span className="absolute top-1 left-1 z-[1] flex items-center justify-center w-4 h-4 rounded-full bg-green-600 text-white text-[9px] font-bold shadow">
                            {cartQty}
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={outOfStock}
                          onClick={() => handleAddToCart(product)}
                          className={`flex flex-col text-left ${
                            outOfStock ? "opacity-50 cursor-not-allowed" : !inCart ? "hover:bg-green-50 active:bg-green-100" : "hover:bg-green-100"
                          }`}
                        >
                          <div className="relative w-full h-16 bg-gray-50 shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <ProductImagePlaceholder name={product.name} className="w-full h-full" />
                            )}
                            <Badge
                              value={product.stock}
                              severity={outOfStock ? "danger" : "info"}
                              className="absolute top-1 right-1 !text-[9px] !min-w-[1.1rem] !h-[1.1rem] !leading-[1.1rem]"
                            />
                          </div>
                          <div className="px-1.5 py-1 flex flex-col gap-0.5">
                            <span className="text-[9px] font-mono text-gray-400 truncate">{product.code}</span>
                            {product.stock_type === stockType.SERIALIZADO && (
                              <span
                                className="flex items-center gap-0.5 w-fit bg-purple-100 text-purple-700 rounded px-1 py-0.5 text-[8px] font-bold leading-none"
                                title="Los seriales se asignan después, en el detalle de la venta"
                              >
                                <i className="pi pi-barcode text-[8px]" /> Serializado
                              </span>
                            )}
                            <p className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[2.2em]">
                              {product.name}
                            </p>
                            <span className="text-[9px] text-gray-400 truncate">{product.brand?.name}</span>
                            <span className="text-xs font-bold text-green-700 mt-0.5 truncate">
                              {formatAmount(convertPrice(product.sale_price))} {noteCurrency}
                            </span>
                          </div>
                        </button>

                        {/* Administrar cantidad directo desde la tarjeta, sin tener que ir al carrito */}
                        {inCart && (
                          <div className="flex items-center gap-0.5 px-1 pb-1">
                            <button
                              type="button"
                              onClick={() => handleDecrement(product._id)}
                              className="flex-1 flex items-center justify-center h-5 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                            >
                              <i className="pi pi-minus text-[9px]" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={cartQty}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleSetQuantity(product._id, Number(e.target.value))}
                              className="w-11 h-5 text-center text-[10px] px-0.5 border border-gray-200 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleIncrement(product._id)}
                              className="flex-1 flex items-center justify-center h-5 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                            >
                              <i className="pi pi-plus text-[9px]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemove(product._id)}
                              className="flex items-center justify-center h-5 w-5 rounded bg-white border border-gray-200 text-red-500 hover:bg-red-50"
                            >
                              <i className="pi pi-trash text-[9px]" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Carrito: sidebar fija en desktop ────────────────────── */}
      <div className="hidden lg:block w-80 shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm p-4 sticky top-4 self-start max-h-[calc(100vh-140px)]">
        <CartPanel
          cart={cart}
          total={cartTotal}
          currency={noteCurrency}
          convertPrice={convertPrice}
          convertToBase={convertToBase}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onSetQuantity={handleSetQuantity}
          onRemove={handleRemove}
          onUpdateDiscount={handleUpdateDiscount}
          onCheckout={handleOpenCheckout}
        />
      </div>

      {/* ── Carrito: barra flotante + dialog en mobile ──────────── */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-10">
          <Button
            className="w-full justify-between shadow-lg"
            severity="success"
            onClick={() => setShowMobileCart(true)}
          >
            <span>{cart.length} producto{cart.length !== 1 ? "s" : ""}</span>
            <span className="font-bold">{formatAmount(cartTotal)} {noteCurrency}</span>
            <i className="pi pi-shopping-cart" />
          </Button>
        </div>
      )}

      <Dialog
        header="Carrito"
        visible={showMobileCart}
        onHide={() => setShowMobileCart(false)}
        className="w-[95vw] md:w-[420px]"
        contentStyle={{ height: "70vh" }}
      >
        <CartPanel
          cart={cart}
          total={cartTotal}
          currency={noteCurrency}
          convertPrice={convertPrice}
          convertToBase={convertToBase}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onSetQuantity={handleSetQuantity}
          onRemove={handleRemove}
          onUpdateDiscount={handleUpdateDiscount}
          onCheckout={handleOpenCheckout}
        />
      </Dialog>

      {/* ── Cobrar: cliente + método de pago ────────────────────── */}
      <Dialog
        header="Cobrar"
        visible={showCheckout}
        onHide={() => setShowCheckout(false)}
        style={{ width: "460px" }}
        breakpoints={{ "640px": "95vw" }}
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button label="Cancelar" severity="secondary" outlined onClick={() => setShowCheckout(false)} />
            <Button
              label="Confirmar venta"
              icon="pi pi-check-circle"
              severity="success"
              loading={submitting}
              disabled={submitting || needsExchangeRate}
              onClick={handleConfirmCheckout}
            />
          </div>
        }
      >
        {checkoutContent}
      </Dialog>

      {/* ── Elegir almacén antes de poder tocar productos ───────── */}
      <Dialog
        header="Elegí el almacén de esta venta"
        visible={showWarehouseGate}
        onHide={() => {}}
        closable={false}
        style={{ width: "420px" }}
        breakpoints={{ "640px": "95vw" }}
      >
        <div className="flex flex-col gap-3 pt-1">
          <p className="text-sm text-gray-600">
            Esta venta se despacha desde un solo almacén. Elegilo antes de empezar a agregar productos — no se
            puede cambiar después.
          </p>
          <DropdownInput
            label="Almacén"
            name="pos_warehouse"
            optionLabel="name"
            placeholder="Seleccionar almacén"
            filter
            mandatory
            options={listWarehouse}
            value={pendingWarehouse}
            onChange={(e) => setPendingWarehouse(e.value)}
            appendTo={document.body}
          />
          <Button
            label="Continuar"
            icon="pi pi-check"
            severity="success"
            disabled={!pendingWarehouse}
            onClick={() => {
              setPosWarehouse(pendingWarehouse);
              setShowWarehouseGate(false);
            }}
            className="justify-center"
          />
        </div>
      </Dialog>

      <ResolveStockShortageModal
        visible={!!stockShortage}
        onHide={() => setStockShortage(null)}
        product={stockShortage?.product ?? null}
        neededQuantity={stockShortage?.neededQuantity ?? 0}
        destinationWarehouseId={posWarehouseId ?? ""}
        destinationWarehouseName={posWarehouse?.name ?? ""}
        onResolved={async () => {
          const resolved = stockShortage;
          setStockShortage(null);
          if (resolved) await resolved.onResolved();
        }}
      />

      <ResolveSerialWarehouseModal
        visible={!!serialMismatch}
        onHide={() => setSerialMismatch(null)}
        productId={serialMismatch?.productId ?? ""}
        productName={serialMismatch?.productName ?? ""}
        serial={serialMismatch?.serial ?? ""}
        originWarehouseId={serialMismatch?.originId ?? ""}
        originWarehouseName={serialMismatch?.originName ?? ""}
        destinationWarehouseId={posWarehouseId ?? ""}
        destinationWarehouseName={posWarehouse?.name ?? ""}
        onResolved={async () => {
          const serial = serialMismatch?.serial;
          setSerialMismatch(null);
          if (serial) await handleScanSerial(serial);
        }}
      />
    </div>
  );
};

export default SaleOrderPOS;
