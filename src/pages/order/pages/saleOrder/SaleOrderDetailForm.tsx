import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { SelectButton } from "primereact/selectbutton";
import { FC, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import BarcodeScannerButton from "../../../../components/barcodeScanner/BarcodeScannerButton";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { OrderDetailFormSkeleton } from "../../../../components/skeleton/OrderDetailFormSkeleton";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import {
  ADD_SERIAL_TO_SALE_ORDER_DETAIL,
  CREATE_CUSTOM_SALE_ORDER_DETAIL,
  CREATE_SALE_ORDER_DETAIL,
} from "../../../../graphql/mutations/SaleOrderDetail";
import { SEARCH_PRODUCT } from "../../../../graphql/queries/Product";
import { FIND_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import { LIST_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { setSaleOrder } from "../../../../redux/slices/saleOrderSlice";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { IProduct } from "../../../../utils/interfaces/Product";
import { ISaleOrderDetailInput } from "../../../../utils/interfaces/SaleOrderDetail";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import useProductList from "../../../product/hooks/useProductList";
import useWarehouseList from "../../../product/hooks/useWarehouseList";
import { schemaFormSaleOrderDetail } from "../../validations/FormSaleOrderDetailValidation";
import useAuth from "../../../auth/hooks/useAuth";
import { convertCurrency, formatAmount, round2 } from "../../../../utils/currency";

interface SaleOrderDetailFormProps {
  saleOrderId: string;
}

const DISCOUNT_TYPES = [
  { label: "Sin descuento", value: "NONE" },
  { label: "Fijo", value: "FIJO" },
  { label: "Porcentual (%)", value: "PORCENTUAL" },
];

const SaleOrderDetailForm: FC<SaleOrderDetailFormProps> = ({ saleOrderId }) => {
  const dispatch = useDispatch();
  const apolloClient = useApolloClient();
  const { currency } = useAuth();

  // Moneda de esta nota en particular: si se está vendiendo en la moneda
  // alterna (ej. Bs con empresa en $), los precios de producto (guardados
  // siempre en la moneda base de la empresa) se convierten al agregarlos.
  const { data: saleOrderQueryData } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    skip: !saleOrderId,
  });
  const noteCurrency = saleOrderQueryData?.findSaleOrder?.currency ?? currency;
  const noteExchangeRate = saleOrderQueryData?.findSaleOrder?.exchange_rate;

  const [createSaleOrderDetail] = useMutation(CREATE_SALE_ORDER_DETAIL, {
    refetchQueries: [{ query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } }],
  });

  const [addSerialToSaleOrderDetail] = useMutation(ADD_SERIAL_TO_SALE_ORDER_DETAIL, {
    refetchQueries: [{ query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } }],
  });

  const [createCustomSaleOrderDetail] = useMutation(CREATE_CUSTOM_SALE_ORDER_DETAIL, {
    refetchQueries: [{ query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } }],
  });

  // "Sin inventario": algo que el vendedor consiguió de un tercero para esta
  // venta puntual, sin manejarlo como producto propio — no descuenta stock.
  const [itemMode, setItemMode] = useState<"CATALOG" | "CUSTOM">("CATALOG");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customQuantity, setCustomQuantity] = useState("");
  const [customCost, setCustomCost] = useState("");
  const [customDiscountType, setCustomDiscountType] = useState<string>("NONE");
  const [customDiscountValue, setCustomDiscountValue] = useState("");
  const [submittingCustom, setSubmittingCustom] = useState(false);

  const initialValues: ISaleOrderDetailInput = {
    product: "",
    sale_order: saleOrderId,
    sale_price: "",
    quantity: "",
    warehouse: "",
    discount_type: "",
    discount_value: "",
  };

  const { listProduct, loadingListProduct } = useProductList();
  const { listWarehouse } = useWarehouseList();

  // Para marcar en el select qué productos ya no se pueden agregar: los que
  // ya están en esta venta (el backend igual lo rechaza, pero mejor no
  // dejarlo seleccionar) y los que no tienen stock.
  const { data: existingDetailsData } = useQuery(LIST_SALE_ORDER_DETAIL, {
    variables: { saleOrderId },
    fetchPolicy: "cache-and-network",
  });
  const addedProductIds = useMemo(() => {
    const details = existingDetailsData?.listSaleOrderDetail ?? [];
    return new Set(details.filter((d: any) => d.product).map((d: any) => d.product._id));
  }, [existingDetailsData]);

  const productOptions = useMemo(
    () =>
      listProduct.map((p: IProduct) => {
        const alreadyAdded = addedProductIds.has(p._id);
        const outOfStock = p.stock <= 0;
        // "stock" incluye lo reservado por otras ventas en Borrador — tanto
        // para Individual (ProductInventory.reserved) como para Serializado
        // (seriales en status "Reservado") — un producto puede mostrar
        // stock > 0 y aun así no tener nada libre para vender ahora.
        // available_stock (calculado en el backend) es lo que de verdad se
        // puede agregar. Mientras quede algo disponible no se marca nada
        // especial — solo importa cuando ya no queda nada libre (bloquea) o
        // para mostrar el número, siempre.
        const tracksReservation = p.stock_type === stockType.INDIVIDUAL || p.stock_type === stockType.SERIALIZADO;
        const fullyReserved = !outOfStock && tracksReservation && p.available_stock === 0;

        let _reason: "ya_agregado" | "sin_stock" | "reservado_total" | null = null;
        if (alreadyAdded) _reason = "ya_agregado";
        else if (outOfStock) _reason = "sin_stock";
        else if (fullyReserved) _reason = "reservado_total";

        return {
          ...p,
          _disabled: alreadyAdded || outOfStock || fullyReserved,
          _reason,
          _availableStock: tracksReservation ? p.available_stock : undefined,
        };
      }),
    [listProduct, addedProductIds]
  );

  const REASON_STYLES: Record<string, { box: string; text: string; label: string }> = {
    ya_agregado: { box: "bg-blue-50 border-blue-200", text: "text-blue-600", label: "Ya en la venta" },
    sin_stock: { box: "bg-red-50 border-red-200", text: "text-red-600", label: "Sin stock" },
    reservado_total: { box: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "Todo reservado" },
  };

  const productItemTemplate = (option: any) => {
    const style = option._reason ? REASON_STYLES[option._reason] : null;

    return (
      <div
        className={`flex items-center justify-between gap-2 w-full rounded-md border px-2 py-1.5 ${
          style ? style.box : "border-transparent"
        }`}
      >
        <span className={option._disabled ? "text-gray-500" : "text-gray-700"}>{option.fullName}</span>
        {style ? (
          <span className={`text-[10px] shrink-0 font-medium ${style.text}`}>{style.label}</span>
        ) : option._availableStock != null ? (
          <span className="text-[10px] shrink-0 text-gray-400">Disponible: {option._availableStock}</span>
        ) : null}
      </div>
    );
  };

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<IWarehouse | null>(null);
  const [discountType, setDiscountType] = useState<string>("NONE");
  // Cambiar la key fuerza a PrimeReact a remontar los dropdowns tras agregar
  // el producto, para que también se limpie el texto de búsqueda interno del
  // filtro (setear value=null no alcanza para eso).
  const [productFieldsKey, setProductFieldsKey] = useState(0);

  const onSubmit = async () => {
    const vars: any = {
      ...values,
      sale_price: Number(values.sale_price),
      quantity: Number(values.quantity),
      discount_type: discountType === "NONE" ? null : discountType,
      discount_value: values.discount_value ? Number(values.discount_value) : null,
    };
    const { data } = await createSaleOrderDetail({ variables: vars });
    resetForm();
    dispatch(setSaleOrder(data.createSaleOrderDetail.sale_order));
    setSelectedProduct(null);
    setSelectedWarehouse(null);
    setDiscountType("NONE");
    setProductFieldsKey((k) => k + 1);
  };

  const resetCustomForm = () => {
    setCustomName("");
    setCustomPrice("");
    setCustomQuantity("");
    setCustomCost("");
    setCustomDiscountType("NONE");
    setCustomDiscountValue("");
  };

  const handleCreateCustomItem = async () => {
    if (!customName.trim() || !customPrice || !customQuantity) {
      showToast({
        detail: "Completa el nombre, precio y cantidad del ítem",
        severity: ToastSeverity.Warn,
      });
      return;
    }
    try {
      setSubmittingCustom(true);
      const { data } = await createCustomSaleOrderDetail({
        variables: {
          sale_order: saleOrderId,
          name: customName.trim(),
          sale_price: Number(customPrice),
          quantity: Number(customQuantity),
          cost: customCost ? Number(customCost) : undefined,
          discount_type: customDiscountType === "NONE" ? null : customDiscountType,
          discount_value: customDiscountValue ? Number(customDiscountValue) : null,
        },
      });
      resetCustomForm();
      dispatch(setSaleOrder(data.createCustomSaleOrderDetail.sale_order));
      showToast({ detail: "Ítem añadido a la venta", severity: ToastSeverity.Success });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      setSubmittingCustom(false);
    }
  };

  // Compartido entre elegir del dropdown a mano y seleccionarlo leyendo un
  // serial — autocompleta el precio igual en los dos casos.
  const applySelectedProduct = (product: IProduct | null) => {
    setSelectedProduct(product);
    setFieldValue("product", product ? product._id : null);
    setTimeout(() => {
      const basePrice = product?.sale_price || 0;
      const convertedPrice = round2(
        convertCurrency(basePrice, currency, noteCurrency, noteExchangeRate)
      );
      setFieldValue("sale_price", convertedPrice || "");
    }, 0);
  };

  const handleProductChange = async (e: AutoCompleteChangeEvent) => {
    applySelectedProduct(e.target.value ?? null);
  };

  // Igual que en el modo rápido (POS): leer un serial (lector físico + Enter,
  // o cámara) agrega el producto directo al detalle con cantidad 1 y le
  // asigna ese serial de una — sin pasar por el dropdown/form de abajo.
  // searchProduct(exact: true) solo matchea ProductSerial, que únicamente
  // existe para SERIALIZADO, así que nunca hace falta elegir almacén acá.
  const [serialSearch, setSerialSearch] = useState("");
  const [scanningSerial, setScanningSerial] = useState(false);

  const handleScanSerial = async (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;
    setScanningSerial(true);
    try {
      const { data } = await apolloClient.query({
        query: SEARCH_PRODUCT,
        variables: { serial: value, exact: true },
        fetchPolicy: "network-only",
      });
      const product: IProduct | null = data?.searchProduct ?? null;
      if (!product) {
        showToast({ detail: `No se encontró ningún producto para "${value}"`, severity: ToastSeverity.Warn });
        return;
      }
      if (addedProductIds.has(product._id)) {
        showToast({ detail: `${product.name} ya está en esta venta`, severity: ToastSeverity.Warn });
        return;
      }

      const convertedPrice = round2(
        convertCurrency(product.sale_price || 0, currency, noteCurrency, noteExchangeRate)
      );
      const { data: createData } = await createSaleOrderDetail({
        variables: {
          product: product._id,
          sale_order: saleOrderId,
          sale_price: convertedPrice,
          quantity: 1,
        },
      });
      const newDetail = createData.createSaleOrderDetail;
      await addSerialToSaleOrderDetail({
        variables: { sale_order_detail: newDetail._id, serial: value },
      });
      dispatch(setSaleOrder(newDetail.sale_order));

      setSerialSearch("");
      showToast({ detail: `${product.name} agregado a la venta`, severity: ToastSeverity.Success });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      setScanningSerial(false);
    }
  };

  const handleWarehouseChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedWarehouse(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const {
    handleChange,
    handleSubmit,
    resetForm,
    values,
    isValid,
    isSubmitting,
    errors,
    dirty,
    setFieldValue,
  } = useFormikForm({
    initialValues,
    msgSuccess: "Producto añadido a la venta",
    handleSubmit: onSubmit,
    validationSchema: schemaFormSaleOrderDetail,
  });

  const grossPreview =
    values.sale_price && values.quantity
      ? Number(values.sale_price) * Number(values.quantity)
      : null;

  const discountPreview = (() => {
    if (!grossPreview || !discountType || !values.discount_value) return null;
    if (discountType === "PORCENTUAL")
      return parseFloat((grossPreview * (Number(values.discount_value) / 100)).toFixed(2));
    if (discountType === "FIJO")
      return parseFloat(Math.min(Number(values.discount_value), grossPreview).toFixed(2));
    return null;
  })();

  const subtotalPreview =
    grossPreview !== null
      ? discountPreview !== null
        ? parseFloat((grossPreview - discountPreview).toFixed(2))
        : grossPreview
      : null;

  if (loadingListProduct) {
    return <OrderDetailFormSkeleton />;
  }

  return (
    <Card className="mb-2">
      <div className="relative mb-3">
        <div className="flex justify-center">
          <SelectButton
            value={itemMode}
            onChange={(e) => e.value && setItemMode(e.value)}
            options={[
              { label: "Producto del catálogo", value: "CATALOG" },
              { label: "Ítem sin inventario", value: "CUSTOM" },
            ]}
            className="w-full sm:w-auto flex [&_.p-button]:flex-1 sm:[&_.p-button]:flex-none [&_.p-button]:justify-center [&_.p-button]:text-xs sm:[&_.p-button]:text-sm sm:[&_.p-button]:whitespace-nowrap"
          />
        </div>
        {itemMode === "CATALOG" && (
          <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2">
            <div className="relative w-full sm:w-72">
              {scanningSerial ? (
                <i className="pi pi-spin pi-spinner absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm" />
              ) : (
                <i className="pi pi-qrcode absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              )}
              <input
                type="text"
                value={serialSearch}
                onChange={(e) => setSerialSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleScanSerial(serialSearch);
                  }
                }}
                placeholder="Escanear o escribir un serial para agregarlo directo"
                className="p-inputtext p-component w-full pl-9 text-sm"
              />
            </div>
            <BarcodeScannerButton onScan={handleScanSerial} />
          </div>
        )}
      </div>

      {itemMode === "CUSTOM" ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 text-center -mt-1 mb-1">
            Para algo que no manejas en tu inventario (lo conseguiste de un tercero para esta venta). No descuenta stock ni aparece en tus reportes por producto.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-2">
            <section className="grid w-full md:w-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2 justify-center items-start">
              <FieldTextInput
                className="md:col-span-2 xl:col-span-2"
                label="Nombre del ítem"
                name="custom_name"
                mandatory
                placeholder="Ej: Cargador USB-C genérico"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <FieldTextInput
                label={`Precio de venta (${noteCurrency})`}
                type="number"
                name="custom_price"
                mandatory
                placeholder="Precio de venta"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
              <FieldTextInput
                label="Cantidad"
                type="number"
                name="custom_quantity"
                mandatory
                placeholder="Cantidad"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
              />
              <FieldTextInput
                className="md:col-span-2 xl:col-span-1"
                label={`Costo (${noteCurrency}, opcional)`}
                type="number"
                name="custom_cost"
                placeholder="Para que impacte en rentabilidad"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
              />
            </section>
            <section className="flex items-end justify-center w-full md:w-auto">
              <Button
                icon="pi pi-plus"
                type="button"
                severity="success"
                label="Agregar ítem"
                disabled={submittingCustom || !customName.trim() || !customPrice || !customQuantity}
                onClick={handleCreateCustomItem}
                className="w-full md:w-auto justify-center"
              />
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t pt-2">
            <SelectButton
              value={customDiscountType}
              options={DISCOUNT_TYPES}
              onChange={(e) => {
                const val = (e.value as string) ?? "NONE";
                setCustomDiscountType(val);
                if (val === "NONE") setCustomDiscountValue("");
              }}
              className="w-full sm:w-auto flex text-sm [&_.p-button]:flex-1 sm:[&_.p-button]:flex-none [&_.p-button]:justify-center sm:[&_.p-button]:whitespace-nowrap"
            />
            {customDiscountType !== "NONE" && (
              <input
                type="number"
                value={customDiscountValue}
                onChange={(e) => setCustomDiscountValue(e.target.value)}
                placeholder={customDiscountType === "PORCENTUAL" ? "% descuento" : `Descuento (${noteCurrency})`}
                min={0}
                className="p-inputtext p-component w-32 text-sm"
              />
            )}
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">

        {/* Fila 1: campos principales + botón */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <section
            className={`grid w-full md:w-auto ${
              selectedProduct && selectedProduct.stock_type === stockType.INDIVIDUAL
                ? "xl:grid-cols-6"
                : "xl:grid-cols-4"
            } grid-cols-1 md:grid-cols-2 gap-2 justify-center items-start`}
          >
            <DropdownInput
              key={`product-${productFieldsKey}`}
              className={`${
                selectedProduct && selectedProduct.stock_type === stockType.INDIVIDUAL
                  ? "2xl:w-[400px] md:col-span-2"
                  : "2xl:w-[500px] md:col-span-2"
              }`}
              label="Producto"
              name="product"
              optionLabel="fullName"
              placeholder="Seleccionar producto"
              filter
              showClear
              mandatory
              options={productOptions}
              optionDisabled="_disabled"
              itemTemplate={productItemTemplate}
              value={selectedProduct}
              error={errors.product ?? ""}
              onChange={handleProductChange}
            />
            {selectedProduct && selectedProduct.stock_type === stockType.INDIVIDUAL && (
              <DropdownInput
                key={`warehouse-${productFieldsKey}`}
                className="2xl:w-[400px] md:col-span-2"
                label="Almacén"
                name="warehouse"
                optionLabel="name"
                placeholder="Seleccionar almacén"
                filter
                showClear
                mandatory
                options={listWarehouse}
                value={selectedWarehouse}
                error={errors.warehouse ?? ""}
                onChange={handleWarehouseChange}
              />
            )}
            <FieldTextInput
              className="md:col-span-1"
              label={`Precio de venta (${noteCurrency})`}
              type="number"
              name="sale_price"
              mandatory
              placeholder="Precio de Venta"
              value={values.sale_price}
              error={errors.sale_price ?? ""}
              onChange={handleChange}
            />
            <FieldTextInput
              className="md:col-span-1"
              label="Cantidad"
              type="number"
              name="quantity"
              mandatory
              placeholder="Cantidad"
              value={values.quantity}
              error={errors.quantity ?? ""}
              onChange={handleChange}
            />
          </section>
          <section className="flex items-end justify-center w-full md:w-auto">
            <Button
              icon="pi pi-plus"
              type="submit"
              severity="success"
              label="Agregar producto"
              disabled={!dirty || !isValid || isSubmitting}
              className="w-full md:w-auto justify-center"
            />
          </section>
        </div>

        {/* Fila 2: descuento */}
        <div className="flex flex-wrap items-center gap-3 border-t pt-2">
          <SelectButton
            value={discountType}
            options={DISCOUNT_TYPES}
            onChange={(e) => {
              const val = (e.value as string) ?? "NONE";
              setDiscountType(val);
              if (val === "NONE") setFieldValue("discount_value", "");
            }}
            className="w-full sm:w-auto flex text-sm [&_.p-button]:flex-1 sm:[&_.p-button]:flex-none [&_.p-button]:justify-center sm:[&_.p-button]:whitespace-nowrap"
          />

          {discountType !== "NONE" && (
            <input
              type="number"
              name="discount_value"
              value={values.discount_value ?? ""}
              onChange={handleChange}
              placeholder={discountType === "PORCENTUAL" ? "% descuento" : `Descuento (${noteCurrency})`}
              min={0}
              className="p-inputtext p-component w-32 text-sm"
            />
          )}

          {subtotalPreview !== null && (
            <div className="flex flex-col gap-0.5 text-sm">
              {discountPreview !== null && discountPreview > 0 && (
                <span className="text-orange-500 text-xs">
                  Descuento: -{formatAmount(discountPreview)} {noteCurrency}
                </span>
              )}
              <span className="font-semibold text-green-600">
                Subtotal: {formatAmount(subtotalPreview ?? 0)} {noteCurrency}
              </span>
            </div>
          )}
        </div>

      </form>
      )}
    </Card>
  );
};

export default SaleOrderDetailForm;
