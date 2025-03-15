import { IProductInput } from "../../../utils/interfaces/Product";
import { useFormikForm } from "../../../hooks/useFormikForm";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import FieldTextareaInput from "../../../components/textAreaInput/FieldTextareaInput";
import { Button } from "primereact/button";
import { useMutation } from "@apollo/client";
import { LIST_PRODUCT } from "../../../graphql/queries/Product";
import { FC, useState } from "react";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import useCategoryList from "../hooks/useCategoryList";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { schemaFormProduct } from "../validations/FormProductValidation";
import { CREATE_PRODUCT } from "../../../graphql/mutations/Product";
import { LIST_CATEGORY } from "../../../graphql/queries/Category";
import { LIST_BRAND } from "../../../graphql/queries/Brand";
import useBrandList from "../hooks/useBrandList";
import { stockType } from "../../../utils/enums/stockType.enum";
import { stockTypeOptions } from "../utils/stockTypeMock";

interface ProductFormProps {
  setVisibleForm: (isVisible: boolean) => void;
}

const ProductForm: FC<ProductFormProps> = ({ setVisibleForm }) => {
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [
      { query: LIST_PRODUCT },
      { query: LIST_CATEGORY },
      { query: LIST_BRAND },
    ],
  });

  const [selectedStockType, setSelectedStockType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { listCategory } = useCategoryList();
  const { listBrand } = useBrandList();
  const initialValues: IProductInput = {
    name: "",
    code: "",
    description: "",
    sale_price: "",
    category: "",
    brand: "",
    stock_type: stockType.SERIALIZADO,
  };

  const onSubmit = async () => {
    await createProduct({ variables: values });
    setVisibleForm(false);
    resetForm();
  };

  const handleStockTypeChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedStockType(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const handleCategoryChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedCategory(value ? value : "");
    e.target.value = value ? value._id : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const handleBrandChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedBrand(value ? value : "");
    e.target.value = value ? value._id : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const {
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
    values,
    errors,
    dirty,
    isValid,
    isSubmitting,
  } = useFormikForm({
    initialValues: initialValues,
    msgSuccess: "Producto Creado",
    handleSubmit: onSubmit,
    validationSchema: schemaFormProduct,
  });

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldTextInput
          label="Nombre"
          type="text"
          name="name"
          placeholder="Nombre"
          mandatory
          value={values.name}
          error={errors.name ? errors.name : ""}
          onChange={handleChange}
        />

        <DropdownInput
          label="Tipo de stock"
          name="stock_type"
          optionLabel="label"
          placeholder="Seleccionar tipo de stock"
          mandatory
          options={stockTypeOptions}
          value={selectedStockType}
          error={errors.stock_type ? errors.stock_type : ""}
          onChange={handleStockTypeChange}
        />

        <DropdownInput
          label="Categoria"
          name="category"
          optionLabel="name"
          placeholder="Seleccionar categoria"
          filter={true}
          showClear={true}
          mandatory
          options={listCategory}
          value={selectedCategory}
          error={errors.category ? errors.category : ""}
          onChange={handleCategoryChange}
        />

        <DropdownInput
          label="Marca"
          name="brand"
          optionLabel="name"
          placeholder="Seleccionar marca"
          filter={true}
          showClear={true}
          mandatory
          options={listBrand}
          value={selectedBrand}
          error={errors.brand ? errors.brand : ""}
          onChange={handleBrandChange}
        />

        <FieldTextInput
          label="Precio de venta"
          type="number"
          name="sale_price"
          placeholder="Precio de venta"
          mandatory
          value={values.sale_price}
          error={errors.sale_price ? errors.sale_price : ""}
          onChange={handleChange}
        />

        <FieldTextareaInput
          label="Descripcion"
          name="description"
          value={values.description}
          rows={5}
          cols={30}
          error={errors.description ? errors.description : ""}
          onChange={handleChange}
        />
      </section>

      <section className="flex justify-center">
        <Button
          type="submit"
          severity="success"
          label="Guardar"
          disabled={!dirty || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default ProductForm;
