import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
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

interface SaleOrderDetailFormProps {
  saleOrderId: string;
}

const SaleOrderDetailForm: FC<SaleOrderDetailFormProps> = ({ saleOrderId }) => {
  const dispatch = useDispatch();
  const [createSaleOrderDetail] = useMutation(CREATE_SALE_ORDER_DETAIL, {
    refetchQueries: [
      {
        query: LIST_SALE_ORDER_DETAIL,
        variables: {
          saleOrderId,
        },
      },
    ],
  });

  const initialValues: ISaleOrderDetailInput = {
    product: "",
    sale_order: saleOrderId,
    sale_price: "",
    quantity: "",
    warehouse: "",
  };

  const { listProduct, loadingListProduct } = useProductList();
  const { listWarehouse } = useWarehouseList();

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<IWarehouse | null>(
    null
  );

  const onSubmit = async () => {
    const { data } = await createSaleOrderDetail({ variables: values });
    resetForm();
    dispatch(setSaleOrder(data.createSaleOrderDetail.sale_order));
    setSelectedProduct(null);
    setSelectedWarehouse(null);
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
    initialValues: initialValues,
    msgSuccess: "Producto añadido a la venta",
    handleSubmit: onSubmit,
    validationSchema: schemaFormSaleOrderDetail,
  });

  if (loadingListProduct) {
    return <OrderDetailFormSkeleton />;
  }

  return (
    <Card className="mb-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row justify-center items-center gap-2"
      >
        <section
          className={`grid ${
            selectedProduct &&
            selectedProduct.stock_type === stockType.INDIVIDUAL
              ? "xl:grid-cols-6"
              : "xl:grid-cols-4"
          }  grid-cols-1 gap-2 justify-center items-start`}
        >
          <DropdownInput
            className={` ${
              selectedProduct &&
              selectedProduct.stock_type === stockType.INDIVIDUAL
                ? "2xl:w-[400px] md:col-span-2"
                : "2xl:w-[500px] md:col-span-2"
            }`}
            label="Producto"
            name="product"
            optionLabel="fullName"
            placeholder="Seleccionar producto"
            filter={true}
            showClear={true}
            mandatory
            options={listProduct}
            value={selectedProduct}
            error={errors.product ? errors.product : ""}
            onChange={handleProductChange}
          />
          {selectedProduct &&
            selectedProduct.stock_type === stockType.INDIVIDUAL && (
              <DropdownInput
                className="2xl:w-[400px] md:col-span-2"
                label="Almacén"
                name="warehouse"
                optionLabel="name"
                placeholder="Seleccionar almacén"
                filter={true}
                showClear={true}
                mandatory
                options={listWarehouse}
                value={selectedWarehouse}
                error={errors.warehouse ? errors.warehouse : ""}
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
            error={errors.sale_price ? errors.sale_price : ""}
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
            error={errors.quantity ? errors.quantity : ""}
            onChange={handleChange}
          />
        </section>
        <section className="flex items-end justify-center">
          <Button
            className="md:col-span-2"
            icon="pi pi-plus"
            type="submit"
            severity="success"
            label="Agregar producto"
            disabled={!dirty || !isValid || isSubmitting}
          />
        </section>
      </form>
    </Card>
  );
};

export default SaleOrderDetailForm;
