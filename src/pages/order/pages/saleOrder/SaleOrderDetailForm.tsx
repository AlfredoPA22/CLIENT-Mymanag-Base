import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { CREATE_SALE_ORDER_DETAIL } from "../../../../graphql/mutations/SaleOrderDetail";
import { LIST_SALE_ORDER_DETAIL } from "../../../../graphql/queries/SaleOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { setSaleOrder } from "../../../../redux/slices/saleOrderSlice";
import { ISaleOrderDetailInput } from "../../../../utils/interfaces/SaleOrderDetail";
import useProductList from "../../../product/hooks/useProductList";
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
  };

  const { listProduct, loadingListProduct } = useProductList();

  const [selectedProduct, setSelectedProduct] = useState(null);

  const onSubmit = async () => {
    const { data } = await createSaleOrderDetail({ variables: values });
    resetForm();
    dispatch(setSaleOrder(data.createSaleOrderDetail.sale_order));
    setSelectedProduct(null);
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

  return (
    <Card className="size-full mb-2">
      <form
        onSubmit={handleSubmit}
        className="flex justify-center items-center"
      >
        {loadingListProduct ? (
          "cargando..."
        ) : (
          <div className="flex md:flex-row flex-col justify-center gap-5">
            <section className="grid md:grid-cols-4 grid-cols-1 gap-5 justify-center items-start">
              <DropdownInput
                className="md:col-span-2"
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
          </div>
        )}
      </form>
    </Card>
  );
};

export default SaleOrderDetailForm;
