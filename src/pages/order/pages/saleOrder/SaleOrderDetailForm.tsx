import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { SelectButton } from "primereact/selectbutton";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import { OrderDetailFormSkeleton } from "../../../../components/skeleton/OrderDetailFormSkeleton";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { CREATE_SALE_ORDER_DETAIL } from "../../../../graphql/mutations/SaleOrderDetail";
import { LIST_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { setSaleOrder } from "../../../../redux/slices/saleOrderSlice";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { IProduct } from "../../../../utils/interfaces/Product";
import { ISaleOrderDetailInput } from "../../../../utils/interfaces/SaleOrderDetail";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import useProductList from "../../../product/hooks/useProductList";
import useWarehouseList from "../../../product/hooks/useWarehouseList";
import { schemaFormSaleOrderDetail } from "../../validations/FormSaleOrderDetailValidation";
import useAuth from "../../../auth/hooks/useAuth";

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
  const { currency } = useAuth();

  const [createSaleOrderDetail] = useMutation(CREATE_SALE_ORDER_DETAIL, {
    refetchQueries: [{ query: LIST_SALE_ORDER_DETAIL, variables: { saleOrderId } }],
  });

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

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<IWarehouse | null>(null);
  const [discountType, setDiscountType] = useState<string>("NONE");

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
  };

  const handleProductChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedProduct(value ? value : null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
    setTimeout(() => {
      setFieldValue("sale_price", e.value.sale_price || "");
    }, 0);
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
      return Math.min(Number(values.discount_value), grossPreview);
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">

        {/* Fila 1: campos principales + botón */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <section
            className={`grid ${
              selectedProduct && selectedProduct.stock_type === stockType.INDIVIDUAL
                ? "xl:grid-cols-6"
                : "xl:grid-cols-4"
            } grid-cols-1 gap-2 justify-center items-start`}
          >
            <DropdownInput
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
              options={listProduct}
              value={selectedProduct}
              error={errors.product ?? ""}
              onChange={handleProductChange}
            />
            {selectedProduct && selectedProduct.stock_type === stockType.INDIVIDUAL && (
              <DropdownInput
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
              label="Precio de venta"
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
          <section className="flex items-end justify-center">
            <Button
              icon="pi pi-plus"
              type="submit"
              severity="success"
              label="Agregar producto"
              disabled={!dirty || !isValid || isSubmitting}
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
            className="text-sm"
          />

          {discountType !== "NONE" && (
            <input
              type="number"
              name="discount_value"
              value={values.discount_value ?? ""}
              onChange={handleChange}
              placeholder={discountType === "PORCENTUAL" ? "% descuento" : `Descuento (${currency})`}
              min={0}
              className="p-inputtext p-component w-32 text-sm"
            />
          )}

          {subtotalPreview !== null && (
            <div className="flex flex-col gap-0.5 text-sm">
              {discountPreview !== null && discountPreview > 0 && (
                <span className="text-orange-500 text-xs">
                  Descuento: -{discountPreview} {currency}
                </span>
              )}
              <span className="font-semibold text-green-600">
                Subtotal: {subtotalPreview} {currency}
              </span>
            </div>
          )}
        </div>

      </form>
    </Card>
  );
};

export default SaleOrderDetailForm;
