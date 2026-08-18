import { useMutation } from "@apollo/client";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CreatableAutoComplete from "../../../../components/creatableAutoComplete/CreatableAutoComplete";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import FieldNumberInput from "../../../../components/FieldNumberInput/FieldNumberInput";
import FieldInputSwitch from "../../../../components/inputSwitch/FieldInputSwitch";
import { FiX } from "react-icons/fi";
import FieldTextareaInput from "../../../../components/textAreaInput/FieldTextareaInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import { CREATE_BRAND } from "../../../../graphql/mutations/Brand";
import { CREATE_CATEGORY } from "../../../../graphql/mutations/Category";
import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
} from "../../../../graphql/mutations/Product";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import { useFormikForm } from "../../../../hooks/useFormikForm";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { stockType } from "../../../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IProduct, IProductInput } from "../../../../utils/interfaces/Product";
import { IReactSelect } from "../../../../utils/interfaces/Select";
import { showToast } from "../../../../utils/toastUtils";
import { uploadImage } from "../../../../utils/uploadImage";
import useBrandList from "../../hooks/useBrandList";
import useCategoryList from "../../hooks/useCategoryList";
import { stockTypeOptions } from "../../utils/stockTypeMock";
import {
  schemaFormProduct,
  schemaFormUpdateProduct,
} from "../../validations/FormProductValidation";
import { Divider } from "primereact/divider";

interface ProductFormProps {
  setVisibleForm: (isVisible: boolean) => void;
  productToEdit?: IProduct | null;
}

const ProductForm: FC<ProductFormProps> = ({
  setVisibleForm,
  productToEdit,
}) => {
  const { listCategorySelect, refetchListCategory } = useCategoryList();
  const { listBrandSelect, refetchListBrand } = useBrandList();

  const dispatch = useDispatch();

  // Ojo: NO se agrega LIST_CATEGORY/LIST_BRAND acá — el select de categoría/
  // marca de este mismo formulario solo muestra el nombre (nunca el contador
  // de productos), así que crear un producto no cambia nada que este select
  // necesite refrescar. Agregarlos disparaba un refetch de esas listas justo
  // cuando el diálogo se cierra (o se vuelve a abrir para el siguiente
  // producto), duplicando en vuelo la misma query que useCategoryList/
  // useBrandList ya lanzan al montar — la causa del select vacío al crear
  // un segundo producto seguido.
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [{ query: LIST_PRODUCT }],
  });
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [
      {
        query: LIST_PRODUCT,
      },
    ],
  });
  // Sin refetchQueries acá a propósito: `{query: LIST_CATEGORY}` refresca
  // CUALQUIER observer activo de esa query en toda la app por coincidencia de
  // documento, no solo el de este formulario — si ese refetch todavía estaba
  // en vuelo cuando este formulario se cierra (al guardar el producto) y se
  // vuelve a abrir para el siguiente, terminaba dejando vacío el select del
  // nuevo formulario. Se llama a refetchListCategory/refetchListBrand
  // directamente (más abajo) sobre la propia query de ESTE formulario.
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [createBrand] = useMutation(CREATE_BRAND);

  const [selectedStockType, setSelectedStockType] = useState(
    stockType.SERIALIZADO
  );
  const [selectedCategory, setSelectedCategory] = useState<IReactSelect | null>(
    null
  );
  const [selectedBrand, setSelectedBrand] = useState<IReactSelect | null>(null);
  // El campo "image" (principal) se manejaba antes con un input de archivo
  // aparte — se quitó porque si se subía un PDF y se eliminaba, el botón
  // desaparecía sin forma de volver a agregar. Ahora la principal es
  // simplemente la primera imagen de la galería. Si el producto ya tenía una
  // "image" guardada que no está en su galería (dato viejo, previo a este
  // cambio), se antepone para no perderla al editar.
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => {
    const existingGallery = productToEdit?.images || [];
    if (productToEdit?.image && !existingGallery.includes(productToEdit.image)) {
      return [productToEdit.image, ...existingGallery];
    }
    return existingGallery;
  });
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryDirty, setGalleryDirty] = useState(false);
  const [hasStorePrice, setHasStorePrice] = useState(
    productToEdit?.store_price != null
  );

  const initialValues: IProductInput = {
    name: productToEdit?.name || "",
    code: productToEdit?.code || "",
    description: productToEdit?.description || "",
    image: "",
    show_in_store: productToEdit?.show_in_store ?? true,
    sale_price: productToEdit?.sale_price || 0,
    min_sale_price: productToEdit?.min_sale_price ?? null,
    store_price: productToEdit?.store_price ?? null,
    store_discount_price: productToEdit?.store_discount_price ?? null,
    category: productToEdit?.category._id || "",
    brand: productToEdit?.brand._id || "",
    stock_type: productToEdit?.stock_type || stockType.SERIALIZADO,
    min_stock: productToEdit?.min_stock || 0,
    max_stock: productToEdit?.max_stock || 0,
  };

  const handleToggleStorePrice = (checked: boolean) => {
    setHasStorePrice(checked);
    if (!checked) {
      setFieldValue("store_price", null);
      setFieldValue("store_discount_price", null);
    }
  };

  const onSubmit = async () => {
    const newlyUploaded = await Promise.all(
      galleryFiles.map((file) => uploadImage(file))
    );
    values.images = [...galleryUrls, ...newlyUploaded];
    values.image = values.images[0] ?? "";
    values.store_price = hasStorePrice ? values.store_price ?? null : null;
    values.store_discount_price = hasStorePrice
      ? values.store_discount_price ?? null
      : null;

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

  const handleCategoryChange = (value: IReactSelect | null) => {
    setSelectedCategory(value);
    setFieldValue("category", value ? value.value : "");
  };

  const onCreateCategory = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createCategory({
        variables: { name: inputValue, description: "" },
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
        await refetchListCategory();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleBrandChange = (value: IReactSelect | null) => {
    setSelectedBrand(value);
    setFieldValue("brand", value ? value.value : "");
  };

  const onCreateBrand = async (inputValue: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await createBrand({
        variables: { name: inputValue, description: "" },
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
        await refetchListBrand();
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleGallerySelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryDirty(true);
    e.target.value = "";
  };

  const removeExistingGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
    setGalleryDirty(true);
  };

  const removePendingGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryDirty(true);
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
    <form onSubmit={handleSubmit} className="grid gap-6">
      {/* 1. Información básica */}
      <section className="space-y-4">
        <Divider align="center">
          <span className="font-semibold text-sm">
            Información del producto
          </span>
        </Divider>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldTextInput
            label="Código"
            type="text"
            name="code"
            mandatory={!!productToEdit}
            placeholder="Código"
            value={values.code}
            error={errors.code || ""}
            onChange={handleChange}
          />
          <FieldTextInput
            label="Nombre"
            type="text"
            name="name"
            placeholder="Nombre"
            mandatory
            value={values.name}
            error={errors.name || ""}
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
            error={errors.stock_type || ""}
            onChange={handleStockTypeChange}
          />
          <FieldTextareaInput
            label="Descripción"
            name="description"
            value={values.description}
            rows={5}
            cols={30}
            error={errors.description || ""}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Galería de imágenes
          </label>
          <p className="text-xs text-gray-400">
            La primera imagen se usa como la principal del producto.
          </p>
          <div className="flex flex-wrap gap-3">
            {galleryUrls.map((url, index) => (
              <div
                key={`existing-${url}`}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingGalleryImage(index)}
                  className="absolute top-0.5 right-0.5 bg-white/90 rounded-full p-0.5 shadow"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
            {galleryFiles.map((file, index) => (
              <div
                key={`pending-${file.name}-${index}`}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                {galleryUrls.length === 0 && index === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                    Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePendingGalleryFile(index)}
                  className="absolute top-0.5 right-0.5 bg-white/90 rounded-full p-0.5 shadow"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 cursor-pointer hover:border-[#A0C82E] hover:text-[#A0C82E]">
              + Agregar
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGallerySelect}
              />
            </label>
          </div>
        </div>
      </section>

      {/* 2. Clasificación y precios */}
      <section className="space-y-4">
        <Divider align="center">
          <span className="font-semibold text-sm">Clasificación y precios</span>
        </Divider>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CreatableAutoComplete
            label="Categoría"
            name="category"
            mandatory
            placeholder="Seleccionar o escribir categoría"
            options={listCategorySelect}
            error={errors.category || ""}
            value={selectedCategory}
            onChange={handleCategoryChange}
            onCreateOption={onCreateCategory}
          />
          <CreatableAutoComplete
            label="Marca"
            name="brand"
            mandatory
            placeholder="Seleccionar o escribir marca"
            options={listBrandSelect}
            error={errors.brand || ""}
            value={selectedBrand}
            onChange={handleBrandChange}
            onCreateOption={onCreateBrand}
          />
          <FieldNumberInput
            label="Precio de venta"
            name="sale_price"
            placeholder="Precio de venta"
            mandatory
            value={values.sale_price}
            error={errors.sale_price || ""}
            onChange={(e: InputNumberChangeEvent) =>
              setFieldValue("sale_price", e.value || 0)
            }
          />
          <FieldNumberInput
            label="Precio de venta mínimo (opcional)"
            name="min_sale_price"
            placeholder="Sin mínimo — se usa el precio de venta"
            value={values.min_sale_price ?? null}
            error={errors.min_sale_price || ""}
            onChange={(e: InputNumberChangeEvent) =>
              setFieldValue("min_sale_price", e.value ?? null)
            }
          />
        </div>
      </section>

      {/* 3. Tienda online */}
      <section className="space-y-4">
        <Divider align="center">
          <span className="font-semibold text-sm">Tienda online</span>
        </Divider>
        <FieldInputSwitch
          label="Mostrar en tienda online"
          name="show_in_store"
          checked={!!values.show_in_store}
          onChange={(e) => setFieldValue("show_in_store", !!e.value)}
        />

        <div className="space-y-2 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Precio especial para la tienda online
              </p>
              <p className="text-xs text-gray-500">
                Si no lo activas, la tienda usa el precio de venta normal.
              </p>
            </div>
            <FieldInputSwitch
              label=""
              name="hasStorePrice"
              checked={hasStorePrice}
              onChange={(e) => handleToggleStorePrice(!!e.value)}
            />
          </div>

          {hasStorePrice && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <FieldNumberInput
                label="Precio para la tienda"
                name="store_price"
                placeholder="Nuevo precio (mayor o menor al normal)"
                value={values.store_price ?? null}
                error={errors.store_price || ""}
                onChange={(e: InputNumberChangeEvent) =>
                  setFieldValue("store_price", e.value)
                }
              />
              <FieldNumberInput
                label="Precio con descuento (opcional)"
                name="store_discount_price"
                placeholder="Debe ser menor al precio de tienda"
                value={values.store_discount_price ?? null}
                error={errors.store_discount_price || ""}
                onChange={(e: InputNumberChangeEvent) =>
                  setFieldValue("store_discount_price", e.value)
                }
              />
              {!!values.store_discount_price &&
                !!values.store_price &&
                values.store_discount_price < values.store_price && (
                  <div className="md:col-span-2 text-sm text-green-700">
                    {Math.round(
                      (1 - values.store_discount_price / values.store_price) * 100
                    )}
                    % de descuento respecto al precio de tienda ({values.store_price})
                  </div>
                )}
            </div>
          )}
        </div>
      </section>

      {/* 4. Gestión de stock */}
      <section className="space-y-4">
        <Divider align="center">
          <span className="font-semibold text-sm">Gestión de stock</span>
        </Divider>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldNumberInput
            label="Stock mínimo"
            name="min_stock"
            placeholder="Stock mínimo"
            mandatory
            value={values.min_stock}
            error={errors.min_stock || ""}
            onChange={(e: InputNumberChangeEvent) =>
              setFieldValue("min_stock", e.value || 0)
            }
          />
          <FieldNumberInput
            label="Stock máximo"
            name="max_stock"
            placeholder="Stock máximo"
            mandatory
            value={values.max_stock}
            error={errors.max_stock || ""}
            onChange={(e: InputNumberChangeEvent) =>
              setFieldValue("max_stock", e.value || 0)
            }
          />
        </div>
      </section>

      {/* Botón */}
      <section className="flex justify-center pt-4">
        <Button
          type="submit"
          severity="success"
          label="Guardar"
          disabled={(!dirty && !galleryDirty) || !isValid || isSubmitting}
        />
      </section>
    </form>
  );
};

export default ProductForm;
