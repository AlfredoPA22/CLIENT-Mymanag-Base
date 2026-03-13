import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { FC, useState } from "react";
import DropdownInput from "../../components/dropdownInput/DropdownInput";
import FieldTextInput from "../../components/textInput/FieldTextInput";
import { OrderDetailFormSkeleton } from "../../components/skeleton/OrderDetailFormSkeleton";
import { CREATE_PRODUCT_TRANSFER_DETAIL } from "../../graphql/mutations/ProductTransfer";
import { LIST_PRODUCT_TRANSFER_DETAIL } from "../../graphql/queries/ProductTransfer";
import { useFormikForm } from "../../hooks/useFormikForm";
import { IProduct } from "../../utils/interfaces/Product";
import { IProductTransferDetailInput } from "../../utils/interfaces/ProductTransfer";
import useProductList from "../product/hooks/useProductList";
import { schemaFormProductTransferDetail } from "./validations/FormProductTransferDetailValidation";

interface ProductTransferDetailFormProps {
  transferId: string;
}

const ProductTransferDetailForm: FC<ProductTransferDetailFormProps> = ({
  transferId,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const [createDetail] = useMutation(CREATE_PRODUCT_TRANSFER_DETAIL, {
    refetchQueries: [
      {
        query: LIST_PRODUCT_TRANSFER_DETAIL,
        variables: { transferId },
      },
    ],
  });

  const { listProduct, loadingListProduct } = useProductList();

  const initialValues: IProductTransferDetailInput = {
    product_transfer: transferId,
    product: "",
    quantity: "",
  };

  const onSubmit = async () => {
    if (selectedProduct && Number(values.quantity) > selectedProduct.stock) {
      throw new Error(
        `Stock insuficiente. Disponible: ${selectedProduct.stock}`
      );
    }
    await createDetail({
      variables: {
        product_transfer: values.product_transfer,
        product: values.product,
        quantity: Number(values.quantity),
      },
    });
    resetForm();
    setSelectedProduct(null);
  };

  const handleProductChange = (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedProduct(value ?? null);
    e.target.value = value ? value._id : null;
    setFieldValue(e.target.name, e.target.value);
  };

  const {
    handleChange,
    handleSubmit,
    resetForm,
    values,
    errors,
    isValid,
    isSubmitting,
    dirty,
    setFieldValue,
  } = useFormikForm<IProductTransferDetailInput>({
    initialValues,
    msgSuccess: "Producto añadido a la transferencia",
    handleSubmit: onSubmit,
    validationSchema: schemaFormProductTransferDetail,
  });

  if (loadingListProduct) return <OrderDetailFormSkeleton />;

  return (
    <Card id="transfer-detail-form" className="mb-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row justify-center items-center gap-2"
      >
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-2 justify-center items-start w-full">
          <DropdownInput
            className="xl:col-span-2"
            label="Producto"
            name="product"
            optionLabel="fullName"
            placeholder="Seleccionar producto"
            filter
            showClear
            mandatory
            options={listProduct}
            value={selectedProduct}
            error={errors.product}
            onChange={handleProductChange}
          />

          <FieldTextInput
            label="Cantidad"
            type="number"
            name="quantity"
            mandatory
            placeholder="Cantidad"
            value={String(values.quantity)}
            error={errors.quantity ? String(errors.quantity) : ""}
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
      </form>
    </Card>
  );
};

export default ProductTransferDetailForm;
