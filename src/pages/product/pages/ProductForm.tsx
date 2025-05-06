import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { FC, useEffect, useState } from "react";
import { ActionMeta, SingleValue } from "react-select";
import DropdownInput from "../../../components/dropdownInput/DropdownInput";
import FieldNumberInput from "../../../components/FieldNumberInput/FieldNumberInput";
import FieldSimpleFileUpload from "../../../components/fileuploadInput/FileUploadInput";
import SelectInput from "../../../components/SelectInput/SelectInput";
import FieldTextareaInput from "../../../components/textAreaInput/FieldTextareaInput";
import FieldTextInput from "../../../components/textInput/FieldTextInput";
import { CREATE_BRAND } from "../../../graphql/mutations/Brand";
import { CREATE_CATEGORY } from "../../../graphql/mutations/Category";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
} from "../../../graphql/mutations/Product";
import { LIST_BRAND } from "../../../graphql/queries/Brand";
import { LIST_CATEGORY } from "../../../graphql/queries/Category";
import { LIST_PRODUCT } from "../../../graphql/queries/Product";
import { useFormikForm } from "../../../hooks/useFormikForm";
import { stockType } from "../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProduct, IProductInput } from "../../../utils/interfaces/Product";
import { IReactSelect } from "../../../utils/interfaces/Select";
import { showToast } from "../../../utils/toastUtils";
import { uploadImage } from "../../../utils/uploadImage";
import useBrandList from "../hooks/useBrandList";
import useCategoryList from "../hooks/useCategoryList";
import { stockTypeOptions } from "../utils/stockTypeMock";
import {
  schemaFormProduct,
  schemaFormUpdateProduct,
} from "../validations/FormProductValidation";

interface ProductFormProps {
  setVisibleForm: (isVisible: boolean) => void;
  productToEdit?: IProduct | null;
}

const ProductForm: FC<ProductFormProps> = ({
  setVisibleForm,
  productToEdit,
}) => {
  const { listCategorySelect } = useCategoryList();
  const { listBrandSelect } = useBrandList();

  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [
      { query: LIST_PRODUCT },
      { query: LIST_CATEGORY },
      { query: LIST_BRAND },
    ],
  });
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [
      {
        query: LIST_PRODUCT,
      },
    ],
  });
  const [createCategory] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: LIST_CATEGORY }],
  });
  const [createBrand] = useMutation(CREATE_BRAND, {
    refetchQueries: [{ query: LIST_BRAND }],
  });

  const [selectedStockType, setSelectedStockType] = useState(
    stockType.SERIALIZADO
  );
  const [selectedCategory, setSelectedCategory] = useState<IReactSelect | null>(
    null
  );
  const [selectedBrand, setSelectedBrand] = useState<IReactSelect | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const initialValues: IProductInput = {
    name: productToEdit?.name || "",
    code: productToEdit?.code || "",
    description: productToEdit?.description || "",
    image: "",
    sale_price: productToEdit?.sale_price || 0,
    category: productToEdit?.category._id || "",
    brand: productToEdit?.brand._id || "",
    stock_type: productToEdit?.stock_type || stockType.SERIALIZADO,
  };

  const onSubmit = async () => {
    if (selectedImage) {
      const data = await uploadImage(selectedImage);
      values.image = data;
    }
    if (productToEdit) {
      await updateProduct({
        variables: {
          productId: productToEdit._id,
          ...values,
        },
      });
    } else {
      await createProduct({ variables: values });
    }
    setVisibleForm(false);
    resetForm();
  };

  const handleStockTypeChange = async (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedStockType(value ? value : "");
    e.target.value = value ? value : "";
    setFieldValue(e.target.name, e.target.value);
  };

  const handleCategoryChange = async (
    event: SingleValue<IReactSelect>,
    action: ActionMeta<IReactSelect>
  ) => {
    setSelectedCategory(event);
    setFieldValue(action.name || "", event ? event.value : "");
  };

  const onCreateCategory = async (inputValue: string) => {
    try {
      const { data } = await createCategory({
        variables: {
          name: inputValue,
          description: "",
        },
      });

      if (data) {
        showToast({
          detail: "Categoria creada",
          severity: ToastSeverity.Success,
        });

        setSelectedCategory({
          value: data.createCategory._id,
          label: data.createCategory.name,
        });

        setFieldValue("category", data.createCategory._id);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const handleBrandChange = async (
    event: SingleValue<IReactSelect>,
    action: ActionMeta<IReactSelect>
  ) => {
    setSelectedBrand(event);
    setFieldValue(action.name || "", event ? event.value : "");
  };

  const onCreateBrand = async (inputValue: string) => {
    try {
      const { data } = await createBrand({
        variables: {
          name: inputValue,
          description: "",
        },
      });

      if (data) {
        showToast({
          detail: "Marca creada",
          severity: ToastSeverity.Success,
        });

        setSelectedBrand({
          value: data.createBrand._id,
          label: data.createBrand.name,
        });

        setFieldValue("brand", data.createBrand._id);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const onFileSelect = (e: { files: File[] }) => {
    const file: File = e.files[0];
    setSelectedImage(file);

    setFieldValue("image", file.name || "");
  };

  const handleFileClear = () => {
    setSelectedImage(null);
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
    msgSuccess: productToEdit ? "Producto Actualizado" : "Producto Creado",
    handleSubmit: onSubmit,
    validationSchema: productToEdit
      ? schemaFormUpdateProduct
      : schemaFormProduct,
  });

  useEffect(() => {
    if (productToEdit) {
      setSelectedCategory({
        value: productToEdit.category?._id || "",
        label: productToEdit.category?.name || "",
      });

      setSelectedBrand({
        value: productToEdit.brand?._id || "",
        label: productToEdit.brand?.name || "",
      });

      setSelectedStockType(productToEdit.stock_type);
    }
  }, [productToEdit]);

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldTextInput
          label="Codigo"
          type="text"
          name="code"
          mandatory={productToEdit ? true : false}
          placeholder="Codigo"
          value={values.code}
          error={errors.code ? errors.code : ""}
          onChange={handleChange}
        />
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

        <FieldNumberInput
          label="Precio de venta"
          name="sale_price"
          placeholder="Precio de venta"
          mandatory
          value={values.sale_price}
          error={errors.sale_price ? errors.sale_price : ""}
          onChange={(e: InputNumberChangeEvent) =>
            setFieldValue("sale_price", e.value || 0)
          }
        />

        <SelectInput
          label="Categoria"
          name="category"
          placeholder="Seleccionar categoria"
          mandatory
          options={listCategorySelect}
          error={errors.category ? errors.category : ""}
          onChange={handleCategoryChange}
          onCreateOption={onCreateCategory}
          value={selectedCategory}
        />

        <SelectInput
          label="Marca"
          name="brand"
          placeholder="Seleccionar marca"
          mandatory
          options={listBrandSelect}
          error={errors.brand ? errors.brand : ""}
          onChange={handleBrandChange}
          onCreateOption={onCreateBrand}
          value={selectedBrand}
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

        <FieldSimpleFileUpload
          id="image"
          label="Imagen"
          onSelect={onFileSelect}
          name="image"
          chooseLabel="Buscar archivo"
          mode="basic"
          auto={false}
          customUpload={true}
          style={{ display: values.image ? "none" : "block" }}
          onFileClear={handleFileClear}
          file={selectedImage}
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
