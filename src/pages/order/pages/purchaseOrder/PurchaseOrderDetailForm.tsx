import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { FC, useState } from "react";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { CREATE_PURCHASE_ORDER_DETAIL } from "../../../../graphql/mutations/PurchaseOrderDetail";
import { LIST_PURCHASE_ORDER_DETAIL } from "../../../../graphql/queries/PurchaseOrderDetail";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { IPurchaseOrderDetailInput } from "../../../../utils/interfaces/PurchaseOrderDetail";
import useProductList from "../../../product/hooks/useProductList";
import { schemaFormPurchaseOrderDetail } from "../../validations/FormPurchaseOrderDetailValidation";
import { useDispatch } from "react-redux";
import { setPurchaseOrder } from "../../../../redux/slices/purchaseOrderSlice";

interface PurchaseOrderDetailFormProps {
  purchaseOrderId: string;
}

const PurchaseOrderDetailForm: FC<PurchaseOrderDetailFormProps> = ({
  purchaseOrderId,
}) => {
  const dispatch= useDispatch();
  const [createPurchaseOrderDetail] = useMutation(
    CREATE_PURCHASE_ORDER_DETAIL,
    {
      refetchQueries: [
        {
          query: LIST_PURCHASE_ORDER_DETAIL,
          variables: {
            purchaseOrderId,
          },
        },
      ],
    }
  );

  const initialValues: IPurchaseOrderDetailInput = {
    product: "",
    purchase_order: purchaseOrderId,
    purchase_price: "",
    quantity: "",
  };

  const { listProduct, loadingListProduct } = useProductList();

  const [selectedProduct, setSelectedProduct] = useState(null);

  const onSubmit = async () => {
   const {data}= await createPurchaseOrderDetail({ variables: values });
    resetForm();
    dispatch(setPurchaseOrder(data.createPurchaseOrderDetail.purchase_order));
    setSelectedProduct(null);
  };

  const handleProductChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedProduct(value ? value : null);
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
    msgSuccess: "Producto añadido a la compra",
    handleSubmit: onSubmit,
    validationSchema: schemaFormPurchaseOrderDetail,
  });

  return (
    <Card className="flex flex-col m-2 h-full">
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
                label="Precio de compra"
                type="number"
                name="purchase_price"
                mandatory
                placeholder="Precio de Compra"
                value={values.purchase_price}
                error={errors.purchase_price ? errors.purchase_price : ""}
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

export default PurchaseOrderDetailForm;
